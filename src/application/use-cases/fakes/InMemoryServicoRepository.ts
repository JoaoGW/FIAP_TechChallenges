import { Servico } from '../../../domain/entities/Servico';
import { ServicoRepository } from '../../../domain/repositories/ServicoRepository';

export class InMemoryServicoRepository implements ServicoRepository {
  public items: Servico[] = [];

  async save(servico: Servico): Promise<void> {
    const index = this.items.findIndex((item) => item.getId() === servico.getId());

    if (index >= 0) {
      this.items[index] = servico;
      return;
    }

    this.items.push(servico);
  }

  async findById(id: string): Promise<Servico | null> {
    return this.items.find((item) => item.getId() === id) ?? null;
  }

  async findAll(): Promise<Servico[]> {
    return [...this.items];
  }
}
