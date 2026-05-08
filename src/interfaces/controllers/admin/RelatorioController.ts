import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObterTempoMedioExecucaoUseCase } from '../../../application/use-cases/ObterTempoMedioExecucaoUseCase';
import { JwtAuthGuard } from '../../guards/JwtAuthGuard';

@ApiTags('Relatorios')
@ApiBearerAuth('JWT')
@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatorioController {
  constructor(
    private readonly obterTempoMedio: ObterTempoMedioExecucaoUseCase,
  ) {}

  @Get('tempo-medio-execucao')
  @ApiOperation({
    summary: 'Tempo medio de execucao dos servicos finalizados',
  })
  @ApiResponse({
    status: 200,
    description: 'Tempo medio calculado em minutos',
    schema: {
      example: {
        mediaEmMinutos: 127,
        totalOSConsideradas: 42,
      },
    },
  })
  async tempoMedio(): Promise<{
    mediaEmMinutos: number;
    totalOSConsideradas: number;
  }> {
    return this.obterTempoMedio.execute();
  }
}
