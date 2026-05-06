import { OrdemDeServico } from '../../domain/entities/OrdemDeServico';
import { StatusOS } from '../../domain/enums/StatusOS';
import { CodigoAcompanhamento } from '../../domain/value-objects/CodigoAcompanhamento';
import { Dinheiro } from '../../domain/value-objects/Dinheiro';
import { ItemOS } from '../../domain/value-objects/ItemOS';
import { ItemServicoOS } from '../../domain/value-objects/ItemServicoOS';
import { Quantidade } from '../../domain/value-objects/Quantidade';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';

export class OrdemDeServicoMapper {
  static toDomain(raw: any): OrdemDeServico {
    const itens = (raw.itens ?? []).map(
      (item: any) =>
        new ItemOS(
          item.pecaId,
          new Quantidade(item.quantidade),
          new Dinheiro(item.precoUnitario),
        ),
    );

    const servicos = (raw.servicos ?? []).map(
      (servico: any) =>
        new ItemServicoOS(
          servico.servicoId,
          new Dinheiro(servico.precoUnitario ?? servico.preco ?? 0),
        ),
    );

    const status = Object.values(StatusOS).includes(raw.status)
      ? (raw.status as StatusOS)
      : StatusOS.RECEBIDA;

    return new OrdemDeServico(
      {
        clienteId: raw.clienteId,
        veiculoId: raw.veiculoId,
        codigoAcompanhamento: raw.codigoAcompanhamento
          ? CodigoAcompanhamento.criar(raw.codigoAcompanhamento)
          : CodigoAcompanhamento.gerar(),
        status,
        servicos,
        itens,
        valorTotal: new Dinheiro(raw.valorTotal ?? 0),
        orcamentoGerado: raw.orcamentoGerado ?? false,
        orcamentoAprovado: raw.orcamentoAprovado ?? false,
        dataInicioExecucao: raw.dataInicioExecucao
          ? new Date(raw.dataInicioExecucao)
          : undefined,
        dataFinalizacao: raw.dataFinalizacao
          ? new Date(raw.dataFinalizacao)
          : undefined,
        dataCriacao: raw.createdAt ? new Date(raw.createdAt) : new Date(),
        dataAtualizacao: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
