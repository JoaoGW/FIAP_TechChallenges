import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { OrdemDeServico } from '../../src/domain/entities/OrdemDeServico';
import { StatusOS } from '../../src/domain/enums/StatusOS';
import { CodigoAcompanhamento } from '../../src/domain/value-objects/CodigoAcompanhamento';
import { Dinheiro } from '../../src/domain/value-objects/Dinheiro';
import { PrismaService } from '../../src/infrastructure/database/PrismaService';
import { PrismaOrdemDeServicoRepository } from '../../src/infrastructure/repositories/PrismaOrdemDeServicoRepository';
import { autenticarAdmin } from '../helpers/autenticarAdmin';
import { criarAppDeTeste } from '../helpers/criarAppDeTeste';
import { limparBancoDeTeste } from '../helpers/limparBancoDeTeste';

describe('Relatorios (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let osRepo: PrismaOrdemDeServicoRepository;
  let token: string;

  beforeAll(async () => {
    app = await criarAppDeTeste();
    prisma = app.get(PrismaService);
    osRepo = app.get(PrismaOrdemDeServicoRepository);
  });

  beforeEach(async () => {
    await limparBancoDeTeste(prisma);
    token = await autenticarAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  function criarOSFinalizadaComDuracao(minutos: number): OrdemDeServico {
    const inicio = new Date('2026-01-01T10:00:00.000Z');
    const fim = new Date(inicio.getTime() + minutos * 60_000);

    return new OrdemDeServico({
      clienteId: 'cliente-relatorio',
      veiculoId: 'veiculo-relatorio',
      codigoAcompanhamento: CodigoAcompanhamento.gerar(),
      status: StatusOS.FINALIZADA,
      servicos: [],
      itens: [],
      valorTotal: Dinheiro.zero(),
      orcamentoGerado: true,
      orcamentoAprovado: true,
      dataInicioExecucao: inicio,
      dataFinalizacao: fim,
      dataCriacao: inicio,
      dataAtualizacao: fim,
    });
  }

  it('sem token deve retornar 401', async () => {
    await request(app.getHttpServer())
      .get('/relatorios/tempo-medio-execucao')
      .expect(401);
  });

  it('com token e sem OS finalizada deve retornar media zero', async () => {
    const response = await request(app.getHttpServer())
      .get('/relatorios/tempo-medio-execucao')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      mediaEmMinutos: 0,
      totalOSConsideradas: 0,
    });
  });

  it('com token e OS finalizadas deve calcular media corretamente', async () => {
    await osRepo.save(criarOSFinalizadaComDuracao(60));
    await osRepo.save(criarOSFinalizadaComDuracao(180));

    const response = await request(app.getHttpServer())
      .get('/relatorios/tempo-medio-execucao')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      mediaEmMinutos: 120,
      totalOSConsideradas: 2,
    });
  });
});
