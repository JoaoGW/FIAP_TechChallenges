import { Veiculo } from '../entities/Veiculo';

export interface VeiculoRepository {
  save(veiculo: Veiculo): Promise<void>;
  findById(id: string): Promise<Veiculo | null>;
  findAll(): Promise<Veiculo[]>;
  findByClienteId(clienteId: string): Promise<Veiculo[]>;
  findByPlaca(placa: string): Promise<Veiculo | null>;
}
