import { Veiculo } from '../../../domain/entities/Veiculo';
import { VeiculoRepository } from '../../../domain/repositories/VeiculoRepository';

export class InMemoryVeiculoRepository implements VeiculoRepository {
  public items: Veiculo[] = [];

  async save(veiculo: Veiculo): Promise<void> {
    const index = this.items.findIndex((item) => item.getId() === veiculo.getId());

    if (index >= 0) {
      this.items[index] = veiculo;
      return;
    }

    this.items.push(veiculo);
  }

  async findById(id: string): Promise<Veiculo | null> {
    return this.items.find((item) => item.getId() === id) ?? null;
  }

  async findAll(): Promise<Veiculo[]> {
    return [...this.items];
  }

  async findByClienteId(clienteId: string): Promise<Veiculo[]> {
    return this.items.filter((item) => item.clienteId === clienteId);
  }

  async findByPlaca(placa: string): Promise<Veiculo | null> {
    return this.items.find((item) => item.placa.valor === placa) ?? null;
  }
}
