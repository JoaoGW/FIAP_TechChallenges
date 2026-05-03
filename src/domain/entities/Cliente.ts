import { Entity } from '../../shared/domain/Entity';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';
import { Documento } from '../value-objects/Documento';

interface ClienteProps {
  nome: string;
  documento: Documento;
  tipo: 'PF' | 'PJ';
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class Cliente extends Entity<ClienteProps> {
  constructor(props: ClienteProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get documento(): Documento {
    return this.props.documento;
  }

  get tipo(): 'PF' | 'PJ' {
    return this.props.tipo;
  }

  get dataCriacao(): Date {
    return this.props.dataCriacao;
  }

  get dataAtualizacao(): Date {
    return this.props.dataAtualizacao;
  }

  static criar(nome: string, documento: Documento, tipo: 'PF' | 'PJ'): Cliente {
    const agora = new Date();
    return new Cliente({
      nome,
      documento,
      tipo,
      dataCriacao: agora,
      dataAtualizacao: agora,
    });
  }
}
