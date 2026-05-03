import { DomainError } from '../../shared/domain/DomainError';

export class PlacaVeiculoInvalidaError extends DomainError {
  constructor(placa: string) {
    super(`A placa ${placa} do veículo é inváida`);
  }
}
