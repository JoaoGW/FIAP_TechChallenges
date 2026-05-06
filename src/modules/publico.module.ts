import { Module } from '@nestjs/common';
import { ConsultarStatusOSUseCase } from '../application/use-cases/ConsultarStatusOSUseCase';
import { PrismaOrdemDeServicoRepository } from '../infrastructure/repositories/PrismaOrdemDeServicoRepository';
import { ConsultaPublicaController } from '../interfaces/controllers/publico/ConsultaPublicaController';
import { RepositoryModule } from './repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [ConsultaPublicaController],
  providers: [
    {
      provide: ConsultarStatusOSUseCase,
      useFactory: (repo: PrismaOrdemDeServicoRepository) =>
        new ConsultarStatusOSUseCase(repo),
      inject: [PrismaOrdemDeServicoRepository],
    },
  ],
})
export class PublicoModule {}
