import { Cliente } from '../entities/Cliente';

export interface ClienteRepository {
  save(cliente: Cliente): Promise<void>;
  findById(id: string): Promise<Cliente | null>;
  findAll(): Promise<Cliente[]>;
  findByDocumento(documento: string): Promise<Cliente | null>;
}
