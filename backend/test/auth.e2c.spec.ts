import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";

describe("AuthController (e2e)", () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeAll(() => {
    authService = new AuthService({} as UsersService, {} as JwtService);
    authController = new AuthController(authService);
  });

  describe("login", () => {
    it("Verifica o retorno do accessToken", async () => {
      const result = {
        accessToken: "validAccessToken",
        refreshToken: "validRefreshToken",
        user: {},
      };

      jest.spyOn(authService, "login").mockResolvedValue(result);

      const response = await authController.login(
        { email: "test@test.com", password: "test" },
        mockResponse
      );
      expect(response).toEqual({ accessToken: "validAccessToken" });
    });

    it("Verifica o lançamento de erro para credenciais inválidas", async () => {
      jest.spyOn(authService, "login").mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        authController.login({ email: "invalid@test.com", password: "invalid" }, mockResponse)
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("Verifica o retorno do usuário registrado", async () => {
      const result = {
        message: "Usuário cadastrado com sucesso",
        user: { id: "1", email: "test@test.com" },
      };
      jest.spyOn(authService, "register").mockResolvedValue(result);

      await expect(
        authController.register({
          nome: "Test User",
          email: "test@test.com",
          senha: "test123456",
        })
      ).resolves.toBe(result);
    });

    it("Verifica o lançamento de erro para registro falho", async () => {
      jest.spyOn(authService, "register").mockRejectedValue(new Error("Registro falhou"));

      await expect(
        authController.register({
          nome: "Test User",
          email: "test@test.com",
          senha: "test123456",
        })
      ).rejects.toThrow("Registro falhou");
    });
  });

  describe("refresh", () => {
    it("Verifica o retorno do novo accessToken", async () => {
      const result = {
        accessToken: "new_valid_token",
        refreshToken: "new_refresh_token",
      };
      jest.spyOn(authService, "refresh").mockResolvedValue(result);

      const mockRequest = {
        cookies: { refreshToken: "valid_refresh_token" },
      } as unknown as Request;

      const response = await authController.refresh(mockRequest, mockResponse);
      expect(response).toEqual({ accessToken: "new_valid_token" });
    });

    it("Verifica o lançamento de erro para refresh token ausente", async () => {
      const mockRequest = { cookies: {} } as unknown as Request;

      await expect(authController.refresh(mockRequest, mockResponse)).rejects.toThrow(
        "Refresh token não encontrado"
      );
    });
  });
});
