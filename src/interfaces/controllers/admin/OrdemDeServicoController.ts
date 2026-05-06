import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/JwtAuthGuard';
import { ListarOrdensDeServicoUseCase } from '../../../application/use-cases/ordem-servico/ListarOrdensDeServicoUseCase';
import { BuscarOrdemDeServicoPorIdUseCase } from '../../../application/use-cases/ordem-servico/BuscarOrdemDeServicoPorIdUseCase';

@ApiTags('Ordens de Servico')
@ApiBearerAuth()
@Controller('ordens-servico')
@UseGuards(JwtAuthGuard)
export class OrdemDeServicoController {
  constructor(
    private readonly listarOrdens: ListarOrdensDeServicoUseCase,
    private readonly buscarOrdemPorId: BuscarOrdemDeServicoPorIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar ordens de servico' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async listar(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.listarOrdens.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem de servico por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.buscarOrdemPorId.execute(id);
  }
}
