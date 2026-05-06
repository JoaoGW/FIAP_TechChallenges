import { Injectable } from '@nestjs/common';
import { OrdemDeServico } from '../../domain/entities/OrdemDeServico';
import { OrdemDeServicoRepository } from '../../domain/repositories/OrdemDeServicoRepository';
import { PaginationParams } from '../../domain/repositories/types';
import { PrismaService } from '../database/PrismaService';
import { OrdemDeServicoMapper } from '../mappers/OrdemDeServicoMapper';

@Injectable()
export class PrismaOrdemDeServicoRepository implements OrdemDeServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(os: OrdemDeServico): Promise<void> {
    await this.prisma.ordemDeServico.upsert?.({
      where: { id: os.getId() },
      create: {
        id: os.getId(),
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
    const raw = await this.prisma.ordemDeServico.findUnique?.({
      where: { id },
      include: { itens: true, servicos: true },
    });
    if (!raw) return null;
    return OrdemDeServicoMapper.toDomain(raw);
  }

  async findAll(
    params?: PaginationParams & {
      status?: string;
    },
  ): Promise<OrdemDeServico[]> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const raws =
      (await this.prisma.ordemDeServico.findMany?.({
        where: {
          status: params?.status,
        },
        include: { itens: true, servicos: true },
        skip: (page - 1) * limit,
        take: limit,
      })) ?? [];
    return raws.map((raw) => OrdemDeServicoMapper.toDomain(raw));
  }

  async findByClienteId(clienteId: string): Promise<OrdemDeServico[]> {
    const raws =
      (await this.prisma.ordemDeServico.findMany?.({
        where: { clienteId },
        include: { itens: true, servicos: true },
      })) ?? [];
    return raws.map((raw) => OrdemDeServicoMapper.toDomain(raw));
  }
}
