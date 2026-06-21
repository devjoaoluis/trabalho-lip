import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({
    summary: "Cadastrar usuário",
    description: "Cria uma nova conta de usuário no sistema.",
  })
  @ApiCreatedResponse({
    description: "Usuário cadastrado com sucesso.",
  })
  @ApiBadRequestResponse({
    description: "Dados inválidos ou e-mail já cadastrado.",
  })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Realizar login",
    description: "Autentica o usuário e retorna um token JWT.",
  })
  @ApiOkResponse({
    description: "Login realizado com sucesso.",
  })
  @ApiUnauthorizedResponse({
    description: "Credenciais inválidas.",
  })
  @ApiBadRequestResponse({
    description: "Dados inválidos.",
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.["refreshToken"];

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não encontrado");
    }

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("refreshToken");
    return { message: "Logout realizado com sucesso" };
  }
}
