import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID único do usuário.",
  })
  id!: string;

  @ApiProperty({
    example: "Joao Luis",
    description: "Nome completo do usuário.",
  })
  nome!: string;

  @ApiProperty({
    example: "joao@gmail.com",
    description: "E-mail do usuário.",
  })
  email!: string;

  @ApiProperty({
    example: "2026-06-21T01:30:00.000Z",
    description: "Data de criação do usuário.",
  })
  criadoEm!: Date;

  @ApiProperty({
    example: "2026-06-21T01:30:00.000Z",
    description: "Data da última atualização do usuário.",
  })
  atualizadoEm!: Date;

  @ApiPropertyOptional({
    example: "https://res.cloudinary.com/seu-cloud/image/upload/v123/foto.jpg",
    description: "URL da foto de perfil do usuário.",
    nullable: true,
  })
  fotoUrl!: string | null;
}
