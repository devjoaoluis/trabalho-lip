import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ReportService } from "./report.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  gerarRelatorio(@Req() req: any, @Body() dto: CreateReportDto) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.gerarRelatorio(usuarioId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  listarRelatorios(@Req() req: any) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.listarRelatorios(usuarioId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  buscarRelatorioPorId(@Req() req: any, @Param("id") id: string) {
    const usuarioId = req.user.id ?? req.user.sub;

    return this.reportService.buscarRelatorioPorId(usuarioId, id);
  }
}
