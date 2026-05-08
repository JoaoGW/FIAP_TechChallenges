import { OrdemDeServico } from '../entities/OrdemDeServico';
import { PaginationParams } from './types';

export interface OrdemDeServicoRepository {
  save(os: OrdemDeServico): Promise<void>;
  findById(id: string): Promise<OrdemDeServico | null>;
  findByCodigoAcompanhamento(
    codigoAcompanhamento: string,
  ): Promise<OrdemDeServico | null>;
  findAll(
    params?: PaginationParams & {
      status?: string;
    },
  ): Promise<OrdemDeServico[]>;
  findByClienteId(clienteId: string): Promise<OrdemDeServico[]>;
  findFinalizadasComPeriodoExecucao?(): Promise<OrdemDeServico[]>;
}
