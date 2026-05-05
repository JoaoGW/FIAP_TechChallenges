import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteController } from './interfaces/controllers/ClienteController';
import { VeiculoController } from './interfaces/controllers/VeiculoController';
import { ServicoController } from './interfaces/controllers/ServicoController';
import { PecaController } from './interfaces/controllers/PecaController';
import { OrdemDeServicoController } from './interfaces/controllers/OrdemDeServicoController';
import { JwtAuthGuard } from './interfaces/guards/JwtAuthGuard';
import { PrismaService } from './infrastructure/database/PrismaService';
import { PrismaClienteRepository } from './infrastructure/repositories/PrismaClienteRepository';
import { PrismaVeiculoRepository } from './infrastructure/repositories/PrismaVeiculoRepository';
import { PrismaServicoRepository } from './infrastructure/repositories/PrismaServicoRepository';
import { PrismaPecaRepository } from './infrastructure/repositories/PrismaPecaRepository';
import { PrismaOrdemDeServicoRepository } from './infrastructure/repositories/PrismaOrdemDeServicoRepository';
import { CriarClienteUseCase } from './application/use-cases/cliente/CriarClienteUseCase';
import { BuscarClientePorIdUseCase } from './application/use-cases/cliente/BuscarClientePorIdUseCase';
import { BuscarClientePorDocumentoUseCase } from './application/use-cases/cliente/BuscarClientePorDocumentoUseCase';
import { ListarClientesUseCase } from './application/use-cases/cliente/ListarClientesUseCase';
import { AtualizarClienteUseCase } from './application/use-cases/cliente/AtualizarClienteUseCase';
import { RemoverClienteUseCase } from './application/use-cases/cliente/RemoverClienteUseCase';
import { CriarVeiculoUseCase } from './application/use-cases/veiculo/CriarVeiculoUseCase';
import { BuscarVeiculoPorIdUseCase } from './application/use-cases/veiculo/BuscarVeiculoPorIdUseCase';
import { ListarVeiculosUseCase } from './application/use-cases/veiculo/ListarVeiculosUseCase';
import { ListarVeiculosPorClienteUseCase } from './application/use-cases/veiculo/ListarVeiculosPorClienteUseCase';
import { AtualizarVeiculoUseCase } from './application/use-cases/veiculo/AtualizarVeiculoUseCase';
import { RemoverVeiculoUseCase } from './application/use-cases/veiculo/RemoverVeiculoUseCase';
import { CriarServicoUseCase } from './application/use-cases/servico/CriarServicoUseCase';
import { BuscarServicoPorIdUseCase } from './application/use-cases/servico/BuscarServicoPorIdUseCase';
import { ListarServicosUseCase } from './application/use-cases/servico/ListarServicosUseCase';
import { AtualizarServicoUseCase } from './application/use-cases/servico/AtualizarServicoUseCase';
import { RemoverServicoUseCase } from './application/use-cases/servico/RemoverServicoUseCase';
import { CriarPecaUseCase } from './application/use-cases/peca/CriarPecaUseCase';
import { BuscarPecaPorIdUseCase } from './application/use-cases/peca/BuscarPecaPorIdUseCase';
import { ListarPecasUseCase } from './application/use-cases/peca/ListarPecasUseCase';
import { AtualizarPecaUseCase } from './application/use-cases/peca/AtualizarPecaUseCase';
import { AjustarEstoqueUseCase } from './application/use-cases/peca/AjustarEstoqueUseCase';
import { RemoverPecaUseCase } from './application/use-cases/peca/RemoverPecaUseCase';
import { ListarOrdensDeServicoUseCase } from './application/use-cases/ordem-servico/ListarOrdensDeServicoUseCase';
import { BuscarOrdemDeServicoPorIdUseCase } from './application/use-cases/ordem-servico/BuscarOrdemDeServicoPorIdUseCase';

@Module({
  imports: [],
  controllers: [
    AppController,
    ClienteController,
    VeiculoController,
    ServicoController,
    PecaController,
    OrdemDeServicoController,
  ],
  providers: [
    AppService,
    JwtAuthGuard,
    PrismaService,
    PrismaClienteRepository,
    PrismaVeiculoRepository,
    PrismaServicoRepository,
    PrismaPecaRepository,
    PrismaOrdemDeServicoRepository,
    {
      provide: CriarClienteUseCase,
      useFactory: (repo: PrismaClienteRepository) => new CriarClienteUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: BuscarClientePorIdUseCase,
      useFactory: (repo: PrismaClienteRepository) =>
        new BuscarClientePorIdUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: BuscarClientePorDocumentoUseCase,
      useFactory: (repo: PrismaClienteRepository) =>
        new BuscarClientePorDocumentoUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: ListarClientesUseCase,
      useFactory: (repo: PrismaClienteRepository) => new ListarClientesUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: AtualizarClienteUseCase,
      useFactory: (repo: PrismaClienteRepository) =>
        new AtualizarClienteUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: RemoverClienteUseCase,
      useFactory: (repo: PrismaClienteRepository) => new RemoverClienteUseCase(repo),
      inject: [PrismaClienteRepository],
    },
    {
      provide: CriarVeiculoUseCase,
      useFactory: (
        veiculoRepo: PrismaVeiculoRepository,
        clienteRepo: PrismaClienteRepository,
      ) => new CriarVeiculoUseCase(veiculoRepo, clienteRepo),
      inject: [PrismaVeiculoRepository, PrismaClienteRepository],
    },
    {
      provide: BuscarVeiculoPorIdUseCase,
      useFactory: (repo: PrismaVeiculoRepository) =>
        new BuscarVeiculoPorIdUseCase(repo),
      inject: [PrismaVeiculoRepository],
    },
    {
      provide: ListarVeiculosUseCase,
      useFactory: (repo: PrismaVeiculoRepository) => new ListarVeiculosUseCase(repo),
      inject: [PrismaVeiculoRepository],
    },
    {
      provide: ListarVeiculosPorClienteUseCase,
      useFactory: (repo: PrismaVeiculoRepository) =>
        new ListarVeiculosPorClienteUseCase(repo),
      inject: [PrismaVeiculoRepository],
    },
    {
      provide: AtualizarVeiculoUseCase,
      useFactory: (repo: PrismaVeiculoRepository) =>
        new AtualizarVeiculoUseCase(repo),
      inject: [PrismaVeiculoRepository],
    },
    {
      provide: RemoverVeiculoUseCase,
      useFactory: (repo: PrismaVeiculoRepository) => new RemoverVeiculoUseCase(repo),
      inject: [PrismaVeiculoRepository],
    },
    {
      provide: CriarServicoUseCase,
      useFactory: (repo: PrismaServicoRepository) => new CriarServicoUseCase(repo),
      inject: [PrismaServicoRepository],
    },
    {
      provide: BuscarServicoPorIdUseCase,
      useFactory: (repo: PrismaServicoRepository) =>
        new BuscarServicoPorIdUseCase(repo),
      inject: [PrismaServicoRepository],
    },
    {
      provide: ListarServicosUseCase,
      useFactory: (repo: PrismaServicoRepository) => new ListarServicosUseCase(repo),
      inject: [PrismaServicoRepository],
    },
    {
      provide: AtualizarServicoUseCase,
      useFactory: (repo: PrismaServicoRepository) =>
        new AtualizarServicoUseCase(repo),
      inject: [PrismaServicoRepository],
    },
    {
      provide: RemoverServicoUseCase,
      useFactory: (
        servicoRepo: PrismaServicoRepository,
        osRepo: PrismaOrdemDeServicoRepository,
      ) => new RemoverServicoUseCase(servicoRepo, osRepo),
      inject: [PrismaServicoRepository, PrismaOrdemDeServicoRepository],
    },
    {
      provide: CriarPecaUseCase,
      useFactory: (repo: PrismaPecaRepository) => new CriarPecaUseCase(repo),
      inject: [PrismaPecaRepository],
    },
    {
      provide: BuscarPecaPorIdUseCase,
      useFactory: (repo: PrismaPecaRepository) => new BuscarPecaPorIdUseCase(repo),
      inject: [PrismaPecaRepository],
    },
    {
      provide: ListarPecasUseCase,
      useFactory: (repo: PrismaPecaRepository) => new ListarPecasUseCase(repo),
      inject: [PrismaPecaRepository],
    },
    {
      provide: AtualizarPecaUseCase,
      useFactory: (repo: PrismaPecaRepository) => new AtualizarPecaUseCase(repo),
      inject: [PrismaPecaRepository],
    },
    {
      provide: AjustarEstoqueUseCase,
      useFactory: (repo: PrismaPecaRepository) => new AjustarEstoqueUseCase(repo),
      inject: [PrismaPecaRepository],
    },
    {
      provide: RemoverPecaUseCase,
      useFactory: (
        pecaRepo: PrismaPecaRepository,
        osRepo: PrismaOrdemDeServicoRepository,
      ) => new RemoverPecaUseCase(pecaRepo, osRepo),
      inject: [PrismaPecaRepository, PrismaOrdemDeServicoRepository],
    },
    {
      provide: ListarOrdensDeServicoUseCase,
      useFactory: (repo: PrismaOrdemDeServicoRepository) =>
        new ListarOrdensDeServicoUseCase(repo),
      inject: [PrismaOrdemDeServicoRepository],
    },
    {
      provide: BuscarOrdemDeServicoPorIdUseCase,
      useFactory: (repo: PrismaOrdemDeServicoRepository) =>
        new BuscarOrdemDeServicoPorIdUseCase(repo),
      inject: [PrismaOrdemDeServicoRepository],
    },
  ],
})
export class AppModule {}
