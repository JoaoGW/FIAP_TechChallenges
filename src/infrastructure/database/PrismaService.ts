import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

type ClienteRow = {
  id: string;
  nome: string;
  documento: string;
  tipo: string;
  contato: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type VeiculoRow = {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ServicoRow = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PecaRow = {
  id: string;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type OrdemDeServicoRow = {
  id: string;
  codigoAcompanhamento: string;
  clienteId: string;
  veiculoId: string;
  status: string;
  valorTotal: number;
  orcamentoGerado: boolean;
  orcamentoAprovado: boolean;
  dataInicioExecucao?: Date | null;
  dataFinalizacao?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ItemOSRow = {
  id: string;
  osId: string;
  pecaId: string;
  quantidade: number;
  precoUnitario: number;
};

type ItemServicoOSRow = {
  id: string;
  osId: string;
  servicoId: string;
  precoUnitario: number;
};

type FindManyArgs = {
  where?: Record<string, any>;
  include?: Record<string, boolean>;
  orderBy?:
    | Record<string, 'asc' | 'desc'>
    | Array<Record<string, 'asc' | 'desc'>>;
  skip?: number;
  take?: number;
};

@Injectable()
export class PrismaService {
  private clientes: ClienteRow[] = [];
  private veiculos: VeiculoRow[] = [];
  private servicos: ServicoRow[] = [];
  private pecas: PecaRow[] = [];
  private ordens: OrdemDeServicoRow[] = [];
  private itensOS: ItemOSRow[] = [];
  private itensServicoOS: ItemServicoOSRow[] = [];

  readonly cliente = {
    upsert: async (args: {
      where: { id: string };
      create: Omit<ClienteRow, 'createdAt' | 'updatedAt'> & Partial<ClienteRow>;
      update: Partial<ClienteRow>;
    }): Promise<void> => {
      const now = new Date();
      const index = this.clientes.findIndex(
        (item) => item.id === args.where.id,
      );
      if (index >= 0) {
        this.clientes[index] = {
          ...this.clientes[index],
          ...args.update,
          updatedAt: now,
        };
        return;
      }
      this.clientes.push({
        ...args.create,
        createdAt: args.create.createdAt ?? now,
        updatedAt: args.create.updatedAt ?? now,
      } as ClienteRow);
    },

    findUnique: async (args: {
      where: Partial<Pick<ClienteRow, 'id' | 'documento'>>;
    }): Promise<ClienteRow | null> => {
      const row = this.clientes.find((item) => {
        if (args.where.id !== undefined) return item.id === args.where.id;
        if (args.where.documento !== undefined) {
          return item.documento === args.where.documento;
        }
        return false;
      });
      return row ? { ...row } : null;
    },

    findMany: async (args?: FindManyArgs): Promise<ClienteRow[]> => {
      const rows = this.applyFindMany(this.clientes, args);
      return rows.map((row) => ({ ...row }));
    },

    deleteMany: async (): Promise<void> => {
      this.clientes = [];
    },
  };

  readonly veiculo = {
    upsert: async (args: {
      where: { id: string };
      create: Omit<VeiculoRow, 'createdAt' | 'updatedAt'> & Partial<VeiculoRow>;
      update: Partial<VeiculoRow>;
    }): Promise<void> => {
      const now = new Date();
      const index = this.veiculos.findIndex(
        (item) => item.id === args.where.id,
      );
      if (index >= 0) {
        this.veiculos[index] = {
          ...this.veiculos[index],
          ...args.update,
          updatedAt: now,
        };
        return;
      }
      this.veiculos.push({
        ...args.create,
        createdAt: args.create.createdAt ?? now,
        updatedAt: args.create.updatedAt ?? now,
      } as VeiculoRow);
    },

    findUnique: async (args: {
      where: Partial<Pick<VeiculoRow, 'id' | 'placa'>>;
    }): Promise<VeiculoRow | null> => {
      const row = this.veiculos.find((item) => {
        if (args.where.id !== undefined) return item.id === args.where.id;
        if (args.where.placa !== undefined)
          return item.placa === args.where.placa;
        return false;
      });
      return row ? { ...row } : null;
    },

    findMany: async (args?: FindManyArgs): Promise<VeiculoRow[]> => {
      const rows = this.applyFindMany(this.veiculos, args);
      return rows.map((row) => ({ ...row }));
    },

    deleteMany: async (): Promise<void> => {
      this.veiculos = [];
    },
  };

  readonly servico = {
    upsert: async (args: {
      where: { id: string };
      create: Omit<ServicoRow, 'createdAt' | 'updatedAt'> & Partial<ServicoRow>;
      update: Partial<ServicoRow>;
    }): Promise<void> => {
      const now = new Date();
      const index = this.servicos.findIndex(
        (item) => item.id === args.where.id,
      );
      if (index >= 0) {
        this.servicos[index] = {
          ...this.servicos[index],
          ...args.update,
          updatedAt: now,
        };
        return;
      }
      this.servicos.push({
        ...args.create,
        createdAt: args.create.createdAt ?? now,
        updatedAt: args.create.updatedAt ?? now,
      } as ServicoRow);
    },

    findUnique: async (args: {
      where: Partial<Pick<ServicoRow, 'id'>>;
    }): Promise<ServicoRow | null> => {
      const row = this.servicos.find((item) => item.id === args.where.id);
      return row ? { ...row } : null;
    },

    findMany: async (args?: FindManyArgs): Promise<ServicoRow[]> => {
      const rows = this.applyFindMany(this.servicos, args);
      return rows.map((row) => ({ ...row }));
    },

    deleteMany: async (): Promise<void> => {
      this.servicos = [];
    },
  };

  readonly peca = {
    upsert: async (args: {
      where: { id: string };
      create: Omit<PecaRow, 'createdAt' | 'updatedAt'> & Partial<PecaRow>;
      update: Partial<PecaRow>;
    }): Promise<void> => {
      const now = new Date();
      const index = this.pecas.findIndex((item) => item.id === args.where.id);
      if (index >= 0) {
        this.pecas[index] = {
          ...this.pecas[index],
          ...args.update,
          updatedAt: now,
        };
        return;
      }
      this.pecas.push({
        ...args.create,
        createdAt: args.create.createdAt ?? now,
        updatedAt: args.create.updatedAt ?? now,
      } as PecaRow);
    },

    findUnique: async (args: {
      where: Partial<Pick<PecaRow, 'id'>>;
    }): Promise<PecaRow | null> => {
      const row = this.pecas.find((item) => item.id === args.where.id);
      return row ? { ...row } : null;
    },

    findMany: async (args?: FindManyArgs): Promise<PecaRow[]> => {
      const rows = this.applyFindMany(this.pecas, args);
      return rows.map((row) => ({ ...row }));
    },

    deleteMany: async (): Promise<void> => {
      this.pecas = [];
    },
  };

  readonly ordemDeServico = {
    upsert: async (args: {
      where: { id: string };
      create: Omit<OrdemDeServicoRow, 'createdAt' | 'updatedAt'> &
        Partial<OrdemDeServicoRow> & {
          itens?: {
            create?: Array<{
              pecaId: string;
              quantidade: number;
              precoUnitario: number;
            }>;
          };
          servicos?: {
            create?: Array<{
              servicoId: string;
              precoUnitario: number;
            }>;
          };
        };
      update: Partial<OrdemDeServicoRow> & {
        itens?: {
          deleteMany?: Record<string, never>;
          create?: Array<{
            pecaId: string;
            quantidade: number;
            precoUnitario: number;
          }>;
        };
        servicos?: {
          deleteMany?: Record<string, never>;
          create?: Array<{
            servicoId: string;
            precoUnitario: number;
          }>;
        };
      };
    }): Promise<void> => {
      const now = new Date();
      const index = this.ordens.findIndex((item) => item.id === args.where.id);

      if (index >= 0) {
        const atual = this.ordens[index];
        this.ordens[index] = {
          ...atual,
          ...args.update,
          updatedAt: now,
        };

        if (args.update.itens?.deleteMany) {
          this.itensOS = this.itensOS.filter((item) => item.osId !== atual.id);
        }
        if (args.update.servicos?.deleteMany) {
          this.itensServicoOS = this.itensServicoOS.filter(
            (item) => item.osId !== atual.id,
          );
        }
        if (args.update.itens?.create?.length) {
          this.itensOS.push(
            ...args.update.itens.create.map((item) => ({
              id: randomUUID(),
              osId: atual.id,
              pecaId: item.pecaId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
            })),
          );
        }
        if (args.update.servicos?.create?.length) {
          this.itensServicoOS.push(
            ...args.update.servicos.create.map((item) => ({
              id: randomUUID(),
              osId: atual.id,
              servicoId: item.servicoId,
              precoUnitario: item.precoUnitario,
            })),
          );
        }
        return;
      }

      const created: OrdemDeServicoRow = {
        ...args.create,
        createdAt: args.create.createdAt ?? now,
        updatedAt: args.create.updatedAt ?? now,
      };
      this.ordens.push(created);

      if (args.create.itens?.create?.length) {
        this.itensOS.push(
          ...args.create.itens.create.map((item) => ({
            id: randomUUID(),
            osId: created.id,
            pecaId: item.pecaId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          })),
        );
      }
      if (args.create.servicos?.create?.length) {
        this.itensServicoOS.push(
          ...args.create.servicos.create.map((item) => ({
            id: randomUUID(),
            osId: created.id,
            servicoId: item.servicoId,
            precoUnitario: item.precoUnitario,
          })),
        );
      }
    },

    findUnique: async (args: {
      where: Partial<Pick<OrdemDeServicoRow, 'id' | 'codigoAcompanhamento'>>;
      include?: { itens?: boolean; servicos?: boolean };
    }): Promise<
      | (OrdemDeServicoRow & {
          itens?: ItemOSRow[];
          servicos?: ItemServicoOSRow[];
        })
      | null
    > => {
      const row = this.ordens.find((item) => {
        if (args.where.id !== undefined) return item.id === args.where.id;
        if (args.where.codigoAcompanhamento !== undefined) {
          return item.codigoAcompanhamento === args.where.codigoAcompanhamento;
        }
        return false;
      });
      if (!row) return null;
      return this.withIncludes(row, args.include);
    },

    findMany: async (
      args?: FindManyArgs,
    ): Promise<
      Array<
        OrdemDeServicoRow & {
          itens?: ItemOSRow[];
          servicos?: ItemServicoOSRow[];
        }
      >
    > => {
      const rows = this.applyFindMany(this.ordens, args);
      return rows.map((row) =>
        this.withIncludes(
          row,
          args?.include as { itens?: boolean; servicos?: boolean },
        ),
      );
    },

    count: async (args?: { where?: Record<string, any> }): Promise<number> => {
      return this.applyFindMany(this.ordens, { where: args?.where }).length;
    },

    deleteMany: async (): Promise<void> => {
      this.ordens = [];
      this.itensOS = [];
      this.itensServicoOS = [];
    },
  };

  readonly itemOS = {
    deleteMany: async (): Promise<void> => {
      this.itensOS = [];
    },
  };

  readonly itemServicoOS = {
    deleteMany: async (): Promise<void> => {
      this.itensServicoOS = [];
    },
  };

  private applyFindMany<T extends Record<string, any>>(
    rows: T[],
    args?: FindManyArgs,
  ): T[] {
    const where = args?.where;
    let filtered = rows;

    if (where) {
      filtered = rows.filter((row) => {
        return Object.entries(where).every(([key, value]) => {
          if (value === undefined) return true;
          if (value && typeof value === 'object' && 'not' in value) {
            const notValue = (value as { not: any }).not;
            return row[key] !== notValue;
          }
          return row[key] === value;
        });
      });
    }

    const orderBy = Array.isArray(args?.orderBy)
      ? args.orderBy
      : args?.orderBy
        ? [args.orderBy]
        : [];

    if (orderBy.length > 0) {
      filtered = [...filtered].sort((current, next) => {
        for (const order of orderBy) {
          const [key, direction] = Object.entries(order)[0] ?? [];
          if (!key) continue;
          const currentValue = current[key];
          const nextValue = next[key];
          if (currentValue === nextValue) continue;
          const comparison = currentValue > nextValue ? 1 : -1;
          return direction === 'desc' ? -comparison : comparison;
        }
        return 0;
      });
    }

    const skip = args?.skip ?? 0;
    const take = args?.take ?? filtered.length;
    return filtered.slice(skip, skip + take);
  }

  private withIncludes(
    row: OrdemDeServicoRow,
    include?: { itens?: boolean; servicos?: boolean },
  ): OrdemDeServicoRow & {
    itens?: ItemOSRow[];
    servicos?: ItemServicoOSRow[];
  } {
    const result: OrdemDeServicoRow & {
      itens?: ItemOSRow[];
      servicos?: ItemServicoOSRow[];
    } = { ...row };

    if (include?.itens) {
      result.itens = this.itensOS
        .filter((item) => item.osId === row.id)
        .map((item) => ({ ...item }));
    }

    if (include?.servicos) {
      result.servicos = this.itensServicoOS
        .filter((item) => item.osId === row.id)
        .map((item) => ({ ...item }));
    }

    return result;
  }
}
