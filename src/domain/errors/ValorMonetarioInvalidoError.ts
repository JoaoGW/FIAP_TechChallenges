import { DomainError } from '../../shared/domain/DomainError';

export class ValorMonetarioInvalidoError extends DomainError {
  constructor(valor: string) {
    super(`O valor de ${valor} inserido eh inválido`);
  }
}
