import { DomainError } from '../../shared/domain/DomainError';

export class DocumentoInvalidoError extends DomainError {
  constructor(doc: string) {
    super(`Documento inserido eh invalido: ${doc}`);
  }
}
