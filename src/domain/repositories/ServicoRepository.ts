import { Servico } from '../entities/Servico';

export interface ServicoRepository {
  save(servico: Servico): Promise<void>;
  findById(id: string): Promise<Servico | null>;
  findAll(): Promise<Servico[]>;
}
