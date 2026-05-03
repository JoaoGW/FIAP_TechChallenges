import { Entity } from '../../shared/domain/Entity';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';
import { EstoqueInsuficienteError } from '../errors/EstoqueInsuficienteError';
import { Dinheiro } from '../value-objects/Dinheiro';
import { Quantidade } from '../value-objects/Quantidade';

interface PecaProps {
  nome: string;
  preco: Dinheiro;
  quantidadeEstoque: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class Peca extends Entity<PecaProps> {
  constructor(props: PecaProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get nome(): string {
    return this.props.nome;
  }

  get preco(): Dinheiro {
    return this.props.preco;
  }

  get quantidadeEstoque(): number {
    return this.props.quantidadeEstoque;
  }

  get dataCriacao(): Date {
    return this.props.dataCriacao;
  }

  get dataAtualizacao(): Date {
    return this.props.dataAtualizacao;
  }

  possuiEstoqueSuficiente(quantidade: Quantidade): boolean {
    return this.props.quantidadeEstoque >= quantidade.valor;
  }

  baixarEstoque(quantidade: Quantidade): void {
    if (!this.possuiEstoqueSuficiente(quantidade)) {
      throw new EstoqueInsuficienteError();
    }
    this.props.quantidadeEstoque -= quantidade.valor;
    this.props.dataAtualizacao = new Date();
  }

  static criar(nome: string, preco: Dinheiro, quantidadeEstoque: number): Peca {
    const agora = new Date();
    return new Peca({
      nome,
      preco,
      quantidadeEstoque,
      dataCriacao: agora,
      dataAtualizacao: agora,
    });
  }
}
