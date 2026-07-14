import { OrdemDeServico } from '../entities/OrdemDeServico';
import { PaginationParams } from './types';

export interface ListarFilaOperacionalParams extends PaginationParams {
  status?: string;
}

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
  listarFilaOperacional(
    params?: ListarFilaOperacionalParams,
  ): Promise<OrdemDeServico[]>;
  findByClienteId(clienteId: string): Promise<OrdemDeServico[]>;
  findFinalizadasComPeriodoExecucao?(): Promise<OrdemDeServico[]>;
}
