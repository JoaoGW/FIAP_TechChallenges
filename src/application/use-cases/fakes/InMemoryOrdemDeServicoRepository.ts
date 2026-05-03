import { OrdemDeServico } from '../../../domain/entities/OrdemDeServico';
import { OrdemDeServicoRepository } from '../../../domain/repositories/OrdemDeServicoRepository';

export class InMemoryOrdemDeServicoRepository
  implements OrdemDeServicoRepository
{
  public items: OrdemDeServico[] = [];

  async save(os: OrdemDeServico): Promise<void> {
    const index = this.items.findIndex((item) => item.getId() === os.getId());

    if (index >= 0) {
      this.items[index] = os;
      return;
    }

    this.items.push(os);
  }

  async findById(id: string): Promise<OrdemDeServico | null> {
    return this.items.find((item) => item.getId() === id) ?? null;
  }

  async findAll(): Promise<OrdemDeServico[]> {
    return [...this.items];
  }

  async findByClienteId(clienteId: string): Promise<OrdemDeServico[]> {
    return this.items.filter((item) => item.clienteId === clienteId);
  }
}
