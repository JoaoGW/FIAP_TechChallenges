import { OrdemDeServico } from '../entities/OrdemDeServico';

export interface OrdemDeServicoRepository {
  save(os: OrdemDeServico): Promise<void>;
  findById(id: string): Promise<OrdemDeServico | null>;
  findAll(): Promise<OrdemDeServico[]>;
  findByClienteId(clienteId: string): Promise<OrdemDeServico[]>;
}
