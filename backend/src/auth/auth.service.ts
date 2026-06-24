import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { sendPasswordResetEmail } from "../config/mailer";
import * as crypto from "crypto";

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("E-mail já cadastrado");
    }

    const user = await this.usersService.create(dto);

    return {
      message: "Usuário cadastrado com sucesso",
      user: this.sanitize(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordValid = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: "access" },
      { expiresIn: "30m" }
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: "refresh" },
      { expiresIn: "7d" }
    );

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.sanitize(user),
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload & { type: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Token inválido");
    }

    const user = await this.usersService.findByRefreshToken(payload.sub, refreshToken);
    if (!user) {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const newAccessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: "access" },
      { expiresIn: "30m" }
    );

    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: "refresh" },
      { expiresIn: "7d" }
    );

    await this.usersService.saveRefreshToken(user.id, newRefreshToken);
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  private sanitize({
    senhaHash: _senhaHash,
    ...safe
  }: {
    senhaHash?: string;
    [key: string]: unknown;
  }) {
    return safe;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: "Se o e-mail estiver cadastrado, um link de recuperação será enviado" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.saveResetToken(user.id, resetToken, expiry);
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log("👉 TOKEN GERADO COM SUCESSO:", resetToken);
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
      // Não rebater o erro para o cliente para evitar revelar detalhes e causar 500
    }

    return { message: "Se o e-mail estiver cadastrado, um link de recuperação será enviado" };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(dto.token);

    if (!user || !user.resetTokenExpiry) {
      throw new BadRequestException("Token inválido ou expirado");
    }

    if (user.resetTokenExpiry < new Date()) {
      await this.usersService.clearResetToken(user.id);
      throw new BadRequestException("Token expirado. Solicite um novo link.");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.usersService.clearResetToken(user.id);

    return { message: "Senha redefinida com sucesso." };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);

    const passwordValid = await bcrypt.compare(dto.currentPassword, user.senhaHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Senha atual incorreta.");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: "Senha alterada com sucesso." };
  }
}
