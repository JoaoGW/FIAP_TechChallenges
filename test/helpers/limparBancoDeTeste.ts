import { PrismaService } from '../../src/infrastructure/database/PrismaService';

export async function limparBancoDeTeste(prisma: PrismaService) {
  await prisma.itemOS?.deleteMany?.();
  await prisma.itemServicoOS?.deleteMany?.();
  await prisma.ordemDeServico?.deleteMany?.();
  await prisma.veiculo?.deleteMany?.();
  await prisma.cliente?.deleteMany?.();
  await prisma.servico?.deleteMany?.();
  await prisma.peca?.deleteMany?.();
}
