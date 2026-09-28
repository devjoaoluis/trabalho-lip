import { ApiProperty } from "@nestjs/swagger";

export class AccessTokenResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    description: "Token JWT de acesso usado para acessar rotas protegidas.",
  })
  accessToken!: string;
}
