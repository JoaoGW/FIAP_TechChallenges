import { Injectable } from '@nestjs/common';
import { OrdemDeServico } from '../../domain/entities/OrdemDeServico';
import { StatusOS } from '../../domain/enums/StatusOS';
import {
  ListarFilaOperacionalParams,
  OrdemDeServicoRepository,
} from '../../domain/repositories/OrdemDeServicoRepository';
import { PaginationParams } from '../../domain/repositories/types';
import { PrismaService } from '../database/PrismaService';
import { OrdemDeServicoMapper } from '../mappers/OrdemDeServicoMapper';

@Injectable()
export class PrismaOrdemDeServicoRepository
  implements OrdemDeServicoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(os: OrdemDeServico): Promise<void> {
    await this.prisma.ordemDeServico.upsert?.({
      where: { id: os.getId() },
      create: {
        id: os.getId(),
        codigoAcompanhamento: os.codigoAcompanhamento.valor,
        clienteId: os.clienteId,
        veiculoId: os.veiculoId,
        status: os.status,
        valorTotal: os.valorTotal.centavos,
        orcamentoAprovado: os.orcamentoAprovado,
        orcamentoGerado: os.orcamentoGerado,
        dataInicioExecucao: os.dataInicioExecucao,
        dataFinalizacao: os.dataFinalizacao,
        itens: {
          create: os.itens.map((item) => ({
            pecaId: item.pecaId,
            quantidade: item.quantidade.valor,
            precoUnitario: item.precoUnitario.centavos,
          })),
        },
        servicos: {
          create: os.servicos.map((servico) => ({
            servicoId: servico.servicoId,
            precoUnitario: servico.preco.centavos,
          })),
        },
      },
      update: {
        status: os.status,
        valorTotal: os.valorTotal.centavos,
        orcamentoAprovado: os.orcamentoAprovado,
        orcamentoGerado: os.orcamentoGerado,
        dataInicioExecucao: os.dataInicioExecucao,
        dataFinalizacao: os.dataFinalizacao,
        itens: {
          deleteMany: {},
          create: os.itens.map((item) => ({
            pecaId: item.pecaId,
            quantidade: item.quantidade.valor,
            precoUnitario: item.precoUnitario.centavos,
          })),
        },
        servicos: {
          deleteMany: {},
          create: os.servicos.map((servico) => ({
            servicoId: servico.servicoId,
            precoUnitario: servico.preco.centavos,
          })),
        },
      },
    });
  }

  async findById(id: string): Promise<OrdemDeServico | null> {
    const ordemData = await this.prisma.ordemDeServico.findUnique?.({
      where: { id },
      include: { itens: true, servicos: true },
    });
    if (!ordemData) return null;
    return OrdemDeServicoMapper.toDomain(ordemData);
  }

  async findByCodigoAcompanhamento(
    codigoAcompanhamento: string,
  ): Promise<OrdemDeServico | null> {
    const ordemData = await this.prisma.ordemDeServico.findUnique?.({
      where: { codigoAcompanhamento },
      include: { itens: true, servicos: true },
    });
    if (!ordemData) return null;
    return OrdemDeServicoMapper.toDomain(ordemData);
  }

  async findAll(
    params?: PaginationParams & {
      status?: string;
    },
  ): Promise<OrdemDeServico[]> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const ordensData =
      (await this.prisma.ordemDeServico.findMany?.({
        where: {
          status: params?.status,
        },
        include: { itens: true, servicos: true },
        skip: (page - 1) * limit,
        take: limit,
      })) ?? [];
    return ordensData.map((ordemData) =>
      OrdemDeServicoMapper.toDomain(ordemData),
    );
  }

  async listarFilaOperacional(
    params?: ListarFilaOperacionalParams,
  ): Promise<OrdemDeServico[]> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    let skip = (page - 1) * limit;
    let remainingTake = limit;
    const statusOperacionais = [
      StatusOS.EM_EXECUCAO,
      StatusOS.AGUARDANDO_APROVACAO,
      StatusOS.EM_DIAGNOSTICO,
      StatusOS.RECEBIDA,
    ];
    const statusPermitidos =
      params?.status === undefined ? statusOperacionais : [params.status];
    const statusFiltrados = statusPermitidos.filter(
      (status): status is StatusOS =>
        statusOperacionais.includes(status as StatusOS),
    );

    if (statusFiltrados.length === 0) return [];

    const resultado: OrdemDeServico[] = [];

    for (const status of statusFiltrados) {
      if (remainingTake === 0) break;

      const totalNoStatus =
        (await this.prisma.ordemDeServico.count?.({
          where: { status },
        })) ?? 0;

      if (skip >= totalNoStatus) {
        skip -= totalNoStatus;
        continue;
      }

      const ordensData =
        (await this.prisma.ordemDeServico.findMany?.({
          where: { status },
          include: { itens: true, servicos: true },
          orderBy: { createdAt: 'asc' },
          skip,
          take: remainingTake,
        })) ?? [];

      resultado.push(
        ...ordensData.map((ordemData) =>
          OrdemDeServicoMapper.toDomain(ordemData),
        ),
      );
      remainingTake -= ordensData.length;
      skip = 0;
    }

    return resultado;
  }

  async findByClienteId(clienteId: string): Promise<OrdemDeServico[]> {
    const ordensData =
      (await this.prisma.ordemDeServico.findMany?.({
        where: { clienteId },
        include: { itens: true, servicos: true },
      })) ?? [];
    return ordensData.map((ordemData) =>
      OrdemDeServicoMapper.toDomain(ordemData),
    );
  }

  async findFinalizadasComPeriodoExecucao(): Promise<OrdemDeServico[]> {
    const ordensData =
      (await this.prisma.ordemDeServico.findMany?.({
        where: {
          dataInicioExecucao: { not: null },
          dataFinalizacao: { not: null },
        },
        include: { itens: true, servicos: true },
      })) ?? [];
    return ordensData.map((ordemData) =>
      OrdemDeServicoMapper.toDomain(ordemData),
    );
  }
}
