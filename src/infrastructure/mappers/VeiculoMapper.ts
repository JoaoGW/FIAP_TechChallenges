import { Veiculo } from '../../domain/entities/Veiculo';
import { PlacaVeiculo } from '../../domain/value-objects/PlacaVeiculo';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';

export class VeiculoMapper {
  static toDomain(raw: any): Veiculo {
    return new Veiculo(
      {
        clienteId: raw.clienteId,
        placa: new PlacaVeiculo(raw.placa),
        marca: raw.marca,
        modelo: raw.modelo,
        ano: raw.ano,
        ativo: raw.ativo ?? true,
        dataCriacao: raw.createdAt ? new Date(raw.createdAt) : new Date(),
        dataAtualizacao: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
