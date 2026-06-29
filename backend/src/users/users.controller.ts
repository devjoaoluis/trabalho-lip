import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/response-user.dto";
import { JwtAuthGuard, type JwtPayload } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/user.decorator";
import { ParseUUIDPipe } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Criar usuário",
    description: "Cria um novo usuário no sistema.",
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: "Usuário criado com sucesso.",
    type: UserResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: "Listar usuários",
    description: "Lista todos os usuários cadastrados no sistema.",
  })
  @ApiOkResponse({
    description: "Usuários listados com sucesso.",
    type: UserResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("me")
  @ApiOperation({
    summary: "Buscar usuário autenticado",
    description: "Retorna os dados do usuário autenticado pelo token JWT.",
  })
  @ApiOkResponse({
    description: "Usuário autenticado retornado com sucesso.",
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  findMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @ApiOperation({
    summary: "Buscar usuário por ID",
    description: "Busca um usuário específico pelo ID.",
  })
  @ApiParam({
    name: "id",
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID do usuário.",
  })
  @ApiOkResponse({
    description: "Usuário encontrado com sucesso.",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    if (id !== user.sub) {
      throw new ForbiddenException("Usuário não autorizado a acessar este recurso");
    }
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("email/:email")
  @ApiOperation({
    summary: "Buscar usuário por E-mail",
    description: "Busca um usuário específico pelo E-mail.",
  })
  @ApiParam({
    name: "email",
    example: "joao@gmail.com",
    description: "E-mail do usuário.",
  })
  @ApiOkResponse({
    description: "Usuário encontrado com sucesso.",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  findByEmail(@Param("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @ApiOperation({
    summary: "Atualizar usuário",
    description: "Atualiza parcialmente os dados de um usuário.",
  })
  @ApiParam({
    name: "id",
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID do usuário.",
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: "Usuário atualizado com sucesso.",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload
  ) {
    if (id !== user.sub) {
      throw new ForbiddenException("Usuário não autorizado a atualizar outro perfil");
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  @ApiOperation({
    summary: "Remover usuário",
    description: "Remove um usuário do sistema.",
  })
  @ApiParam({
    name: "id",
    example: "b3bdbdd4-34d2-45d1-9e10-872b0d2f8a7e",
    description: "ID do usuário.",
  })
  @ApiNoContentResponse({
    description: "Usuário removido com sucesso.",
  })
  @ApiNotFoundResponse({
    description: "Usuário não encontrado.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    if (id !== user.sub) {
      throw new ForbiddenException("Usuário não autorizado a acessar este recurso");
    }
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("me/photo")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException("Apenas imagens JPEG, PNG ou WEBP são permitidas."),
            false
          );
        }

        callback(null, true);
      },
    })
  )
  @ApiOperation({
    summary: "Atualizar foto de perfil",
    description:
      "Envia uma imagem para o Cloudinary e salva a URL como foto de perfil do usuário autenticado.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Imagem de perfil do usuário.",
        },
      },
      required: ["file"],
    },
  })
  @ApiOkResponse({
    description: "Foto de perfil atualizada com sucesso.",
    type: UserResponseDto,
  })
  async updateProfilePhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Imagem não enviada.");
    }

    const usuarioId = req.user.id ?? req.user.sub;

    return this.usersService.updateProfilePhoto(usuarioId, file);
  }
}
