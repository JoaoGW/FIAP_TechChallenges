import { OrdemDeServico } from '../../src/domain/entities/OrdemDeServico';
import { PrismaService } from '../../src/infrastructure/database/PrismaService';

export async function limparBancoDeTeste(prisma: PrismaService) {
  await prisma.historicoStatusOS.deleteMany();
  await prisma.itemOS.deleteMany();
  await prisma.itemServicoOS.deleteMany();
  await prisma.ordemDeServico.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.peca.deleteMany();
}

export async function criarDependenciasParaOS(
  prisma: PrismaService,
  ordens: OrdemDeServico[],
): Promise<void> {
  for (const os of ordens) {
    await prisma.cliente.upsert({
      where: { id: os.clienteId },
      create: {
        id: os.clienteId,
        nome: `Cliente ${os.clienteId}`,
        documento: `documento-${os.clienteId}`,
        tipo: 'PF',
        contato: 'teste@oficina.local',
      },
      update: {},
    });
    await prisma.veiculo.upsert({
      where: { id: os.veiculoId },
      create: {
        id: os.veiculoId,
        clienteId: os.clienteId,
        placa: `placa-${os.veiculoId}`,
        marca: 'Marca teste',
        modelo: 'Modelo teste',
        ano: 2026,
      },
      update: {},
    });
    for (const servico of os.servicos) {
      await prisma.servico.upsert({
        where: { id: servico.servicoId },
        create: {
          id: servico.servicoId,
          nome: `Servico ${servico.servicoId}`,
          descricao: 'Servico criado para fixture',
          preco: servico.preco.centavos,
        },
        update: {},
      });
    }
    for (const item of os.itens) {
      await prisma.peca.upsert({
        where: { id: item.pecaId },
        create: {
          id: item.pecaId,
          nome: `Peca ${item.pecaId}`,
          preco: item.precoUnitario.centavos,
          quantidadeEstoque: 100,
        },
        update: {},
      });
    }
  }
}
