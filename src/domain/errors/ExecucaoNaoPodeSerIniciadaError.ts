import { DomainError } from '../../shared/domain/DomainError';

export class ExecucaoNaoPodeSerIniciadaError extends DomainError {
  constructor(exec: string) {
    super(`A execução ${exec} não pode ser inciiada`);
  }
}
