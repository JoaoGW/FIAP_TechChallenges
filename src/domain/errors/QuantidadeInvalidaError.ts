import { DomainError } from '../../shared/domain/DomainError';

export class QuantidadeInvalidaError extends DomainError {
  constructor(qtd: string) {
    super(`A quantidade de ${qtd} inserida é inválida`);
  }
}
