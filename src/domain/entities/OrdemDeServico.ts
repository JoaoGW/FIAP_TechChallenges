import { Entity } from '../../shared/domain/Entity';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';
import { StatusOS, transicoesValidas } from '../enums/StatusOS';
import { ItemOS } from '../value-objects/ItemOS';
import { Dinheiro } from '../value-objects/Dinheiro';
import { Quantidade } from '../value-objects/Quantidade';
import { TransicaoStatusInvalidaError } from '../errors/TransicaoStatusInvalidaError';
import { OrcamentoNaoPodeSerGeradoError } from '../errors/OrcamentoNaoPodeSerGeradoError';
import { ExecucaoNaoPodeSerIniciadaError } from '../errors/ExecucaoNaoPodeSerIniciadaError';
import { OrdemDeServicoSemServicoError } from '../errors/OrdemDeServicoSemServicoError';

interface OrdemDeServicoProps {
  clienteId: string;
  veiculoId: string;
  status: StatusOS;
  servicoIds: string[];
  itens: ItemOS[];
  valorTotal: Dinheiro;
  dataInicioExecucao?: Date;
  dataFinalizacao?: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export class OrdemDeServico extends Entity<OrdemDeServicoProps> {
  constructor(props: OrdemDeServicoProps, id?: UniqueEntityId) {
    super(props, id);
  }

  // GETs
  get status(): StatusOS {
    return this.props.status;
  }
  get valorTotal(): Dinheiro {
    return this.props.valorTotal;
  }
  get itens(): ItemOS[] {
    return [...this.props.itens];
  }
  get servicoIds(): string[] {
    return [...this.props.servicoIds];
  }
  get dataInicioExecucao(): Date | undefined {
    return this.props.dataInicioExecucao;
  }
  get dataFinalizacao(): Date | undefined {
    return this.props.dataFinalizacao;
  }
  get dataAtualizacao(): Date {
    return this.props.dataAtualizacao;
  }

  // Estados
  private transicionar(para: StatusOS): void {
    const permitido = transicoesValidas[this.props.status];
    if (permitido !== para) {
      throw new TransicaoStatusInvalidaError(this.props.status, para);
    }
    this.props.status = para;
    this.props.dataAtualizacao = new Date();
  }

  // Métodos do Domínio
  iniciarDiagnostico(): void {
    this.transicionar(StatusOS.EM_DIAGNOSTICO);
  }

  adicionarServico(servicoId: string): void {
    this.props.servicoIds.push(servicoId);
    this.props.dataAtualizacao = new Date();
  }

  adicionarPeca(
    pecaId: string,
    quantidade: Quantidade,
    precoUnitario: Dinheiro,
  ): void {
    const item = new ItemOS(pecaId, quantidade, precoUnitario);
    this.props.itens.push(item);
    this.props.dataAtualizacao = new Date();
  }

  gerarOrcamento(precosServicos: Dinheiro[]): void {
    if (this.props.status !== StatusOS.EM_DIAGNOSTICO) {
      throw new OrcamentoNaoPodeSerGeradoError();
    }
    if (this.props.servicoIds.length === 0) {
      throw new OrdemDeServicoSemServicoError();
    }
    const totalServicos = precosServicos.reduce(
      (acc, p) => acc.somar(p),
      Dinheiro.zero(),
    );
    const totalPecas = this.props.itens.reduce(
      (acc, item) => acc.somar(item.subtotal),
      Dinheiro.zero(),
    );
    this.props.valorTotal = totalServicos.somar(totalPecas);
    this.props.dataAtualizacao = new Date();
  }

  enviarOrcamentoParaAprovacao(): void {
    this.transicionar(StatusOS.AGUARDANDO_APROVACAO);
  }

  aprovarOrcamento(): void {
    this.transicionar(StatusOS.EM_EXECUCAO);
  }

  iniciarExecucao(): void {
    if (this.props.status !== StatusOS.AGUARDANDO_APROVACAO) {
      throw new ExecucaoNaoPodeSerIniciadaError();
    }
    this.transicionar(StatusOS.EM_EXECUCAO);
    this.props.dataInicioExecucao = new Date();
  }

  finalizarServico(): void {
    this.transicionar(StatusOS.FINALIZADA);
    this.props.dataFinalizacao = new Date();
  }

  entregarVeiculo(): void {
    this.transicionar(StatusOS.ENTREGUE);
  }

  // Factory
  static criar(clienteId: string, veiculoId: string): OrdemDeServico {
    return new OrdemDeServico({
      clienteId,
      veiculoId,
      status: StatusOS.RECEBIDA,
      servicoIds: [],
      itens: [],
      valorTotal: Dinheiro.zero(),
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    });
  }
}
