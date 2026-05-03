import { Entity } from '../../shared/domain/Entity';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';
import { Dinheiro } from '../value-objects/Dinheiro';

interface ServicoProps {
  nome: string;
  descricao: string;
  preco: Dinheiro;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class Servico extends Entity<ServicoProps> {
  constructor(props: ServicoProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get preco(): Dinheiro {
    return this.props.preco;
  }

  get dataCriacao(): Date {
    return this.props.dataCriacao;
  }

  get dataAtualizacao(): Date {
    return this.props.dataAtualizacao;
  }

  static criar(nome: string, descricao: string, preco: Dinheiro): Servico {
    const agora = new Date();
    return new Servico({
      nome,
      descricao,
      preco,
      dataCriacao: agora,
      dataAtualizacao: agora,
    });
  }
}
