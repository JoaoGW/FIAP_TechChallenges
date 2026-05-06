import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/JwtAuthGuard';
import { CriarVeiculoDto } from '../../dtos/veiculo/CriarVeiculoDto';
import { AtualizarVeiculoDto } from '../../dtos/veiculo/AtualizarVeiculoDto';
import { CriarVeiculoUseCase } from '../../../application/use-cases/veiculo/CriarVeiculoUseCase';
import { BuscarVeiculoPorIdUseCase } from '../../../application/use-cases/veiculo/BuscarVeiculoPorIdUseCase';
import { ListarVeiculosUseCase } from '../../../application/use-cases/veiculo/ListarVeiculosUseCase';
import { ListarVeiculosPorClienteUseCase } from '../../../application/use-cases/veiculo/ListarVeiculosPorClienteUseCase';
import { AtualizarVeiculoUseCase } from '../../../application/use-cases/veiculo/AtualizarVeiculoUseCase';
import { RemoverVeiculoUseCase } from '../../../application/use-cases/veiculo/RemoverVeiculoUseCase';

@ApiTags('Veiculos')
@ApiBearerAuth()
@Controller('veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculoController {
  constructor(
    private readonly criarVeiculo: CriarVeiculoUseCase,
    private readonly buscarVeiculoPorId: BuscarVeiculoPorIdUseCase,
    private readonly listarVeiculos: ListarVeiculosUseCase,
    private readonly listarVeiculosPorCliente: ListarVeiculosPorClienteUseCase,
    private readonly atualizarVeiculo: AtualizarVeiculoUseCase,
    private readonly removerVeiculo: RemoverVeiculoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar veiculo' })
  async criar(@Body() body: CriarVeiculoDto): Promise<{ id: string }> {
    return this.criarVeiculo.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veiculos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listar(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.listarVeiculos.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      ativo: true,
    });
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Listar veiculos por cliente' })
  async listarPorCliente(@Param('clienteId') clienteId: string) {
    return this.listarVeiculosPorCliente.execute({ clienteId, ativo: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veiculo por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.buscarVeiculoPorId.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar veiculo' })
  async atualizar(@Param('id') id: string, @Body() body: AtualizarVeiculoDto) {
    return this.atualizarVeiculo.execute({ id, ...body });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar veiculo' })
  async remover(@Param('id') id: string) {
    return this.removerVeiculo.execute({ id });
  }
}
