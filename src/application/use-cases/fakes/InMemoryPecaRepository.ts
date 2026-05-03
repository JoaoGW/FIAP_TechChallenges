import { Peca } from '../../../domain/entities/Peca';
import { PecaRepository } from '../../../domain/repositories/PecaRepository';

export class InMemoryPecaRepository implements PecaRepository {
  public items: Peca[] = [];

  async save(peca: Peca): Promise<void> {
    const index = this.items.findIndex((item) => item.getId() === peca.getId());

    if (index >= 0) {
      this.items[index] = peca;
      return;
    }

    this.items.push(peca);
  }

  async findById(id: string): Promise<Peca | null> {
    return this.items.find((item) => item.getId() === id) ?? null;
  }

  async findAll(): Promise<Peca[]> {
    return [...this.items];
  }
}
