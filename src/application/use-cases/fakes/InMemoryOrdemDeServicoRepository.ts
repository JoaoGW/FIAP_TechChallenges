import { OrdemDeServico } from '../../../domain/entities/OrdemDeServico';
import { OrdemDeServicoRepository } from '../../../domain/repositories/OrdemDeServicoRepository';
import { PaginationParams } from '../../../domain/repositories/types';

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

  async findAll(
    params?: PaginationParams & {
      status?: string;
    },
  ): Promise<OrdemDeServico[]> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const status = params?.status;
    const filtered =
      status === undefined
        ? this.items
        : this.items.filter((item) => item.status === status);
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }

  async findByClienteId(clienteId: string): Promise<OrdemDeServico[]> {
    return this.items.filter((item) => item.clienteId === clienteId);
  }
}
