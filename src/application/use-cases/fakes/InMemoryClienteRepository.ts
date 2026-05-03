import { Cliente } from '../../../domain/entities/Cliente';
import { ClienteRepository } from '../../../domain/repositories/ClienteRepository';

export class InMemoryClienteRepository implements ClienteRepository {
  public items: Cliente[] = [];

  async save(cliente: Cliente): Promise<void> {
    const index = this.items.findIndex((item) => item.getId() === cliente.getId());

    if (index >= 0) {
      this.items[index] = cliente;
      return;
    }

    this.items.push(cliente);
  }

  async findById(id: string): Promise<Cliente | null> {
    return this.items.find((item) => item.getId() === id) ?? null;
  }

  async findAll(): Promise<Cliente[]> {
    return [...this.items];
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    return this.items.find((item) => item.documento.valor === documento) ?? null;
  }
}
