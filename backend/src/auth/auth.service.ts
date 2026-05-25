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

    const passwordValid = await bcrypt.compare(dto.password, user.senhaHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: this.sanitize(user),
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
