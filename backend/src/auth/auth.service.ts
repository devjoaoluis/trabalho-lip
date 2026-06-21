import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";

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
}
