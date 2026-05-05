import { Injectable } from '@nestjs/common';

type PrismaLikeModel = {
  upsert?: (args: any) => Promise<any>;
  findUnique?: (args: any) => Promise<any>;
  findMany?: (args: any) => Promise<any[]>;
};

@Injectable()
export class PrismaService {
  // Minimal contract for current phase scaffolding.
  // It is intentionally generic and will be replaced with real PrismaClient integration.
  cliente: PrismaLikeModel = {};
  veiculo: PrismaLikeModel = {};
  servico: PrismaLikeModel = {};
  peca: PrismaLikeModel = {};
  ordemDeServico: PrismaLikeModel = {};
}
