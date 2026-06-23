import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: "Gerar relatório",
    description:
      "Gera um relatório de tarefas do usuário autenticado dentro de um período informado.",
  })
  @ApiBody({ type: CreateReportDto })
  @ApiCreatedResponse({
    description: "Relatório gerado com sucesso.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  gerarRelatorio(@Req() req: any, @Body() dto: CreateReportDto) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.gerarRelatorio(usuarioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: "Listar relatórios",
    description: "Lista todos os relatórios gerados pelo usuário autenticado.",
  })
  @ApiOkResponse({
    description: "Relatórios listados com sucesso.",
  })
  @ApiUnauthorizedResponse({
    description: "Token não encontrado ou inválido.",
  })
  listarRelatorios(@Req() req: any) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.listarRelatorios(usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({
    summary: "Buscar relatório por ID",
    description: "Busca um relatório específico do usuário autenticado.",
  })
  @ApiParam({
    name: "id",
    example: "21d9d859-f8d1-4a80-9947-dc9c19387512",
    description: "ID do relatório.",
  })
  @ApiOkResponse({
    description: "Relatório encontrado com sucesso.",
  })
  @ApiNotFoundResponse({
    description: "Relatório não encontrado.",
  })
  buscarRelatorioPorId(@Req() req: any, @Param("id") id: string) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.buscarRelatorioPorId(usuarioId, id);
  }
}
