import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdicionarPecaOSUseCase } from '../../src/application/use-cases/AdicionarPecaOSUseCase';
import { AdicionarServicoOSUseCase } from '../../src/application/use-cases/AdicionarServicoOSUseCase';
import { AprovarOrcamentoUseCase } from '../../src/application/use-cases/AprovarOrcamentoUseCase';
import { CriarOrdemDeServicoUseCase } from '../../src/application/use-cases/CriarOrdemDeServicoUseCase';
import { EntregarVeiculoUseCase } from '../../src/application/use-cases/EntregarVeiculoUseCase';
import { EnviarOrcamentoParaAprovacaoUseCase } from '../../src/application/use-cases/EnviarOrcamentoParaAprovacaoUseCase';
import { FinalizarServicoUseCase } from '../../src/application/use-cases/FinalizarServicoUseCase';
import { GerarOrcamentoUseCase } from '../../src/application/use-cases/GerarOrcamentoUseCase';
import { IniciarDiagnosticoUseCase } from '../../src/application/use-cases/IniciarDiagnosticoUseCase';
import { IniciarExecucaoUseCase } from '../../src/application/use-cases/IniciarExecucaoUseCase';
import { PrismaService } from '../../src/infrastructure/database/PrismaService';
import { PrismaClienteRepository } from '../../src/infrastructure/repositories/PrismaClienteRepository';
import { PrismaOrdemDeServicoRepository } from '../../src/infrastructure/repositories/PrismaOrdemDeServicoRepository';
import { PrismaPecaRepository } from '../../src/infrastructure/repositories/PrismaPecaRepository';
import { PrismaServicoRepository } from '../../src/infrastructure/repositories/PrismaServicoRepository';
import { PrismaVeiculoRepository } from '../../src/infrastructure/repositories/PrismaVeiculoRepository';
import { autenticarAdmin } from '../helpers/autenticarAdmin';
import { criarAppDeTeste } from '../helpers/criarAppDeTeste';
import { limparBancoDeTeste } from '../helpers/limparBancoDeTeste';

describe('Ordens de Servico (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let osRepo: PrismaOrdemDeServicoRepository;
  let clienteRepo: PrismaClienteRepository;
  let veiculoRepo: PrismaVeiculoRepository;
  let servicoRepo: PrismaServicoRepository;
  let pecaRepo: PrismaPecaRepository;

  beforeAll(async () => {
    app = await criarAppDeTeste();
    prisma = app.get(PrismaService);
    osRepo = app.get(PrismaOrdemDeServicoRepository);
    clienteRepo = app.get(PrismaClienteRepository);
    veiculoRepo = app.get(PrismaVeiculoRepository);
    servicoRepo = app.get(PrismaServicoRepository);
    pecaRepo = app.get(PrismaPecaRepository);
  });

  beforeEach(async () => {
    await limparBancoDeTeste(prisma);
    token = await autenticarAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /ordens-servico sem token deve retornar 401', async () => {
    await request(app.getHttpServer()).get('/ordens-servico').expect(401);
  });

  it('deve executar fluxo completo da OS e validar status final ENTREGUE', async () => {
    const clienteResponse = await request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Cliente Fluxo',
        documento: '52998224725',
        contato: 'fluxo@email.com',
      })
      .expect(201);
    const clienteId = clienteResponse.body.id as string;

    const veiculoResponse = await request(app.getHttpServer())
      .post('/veiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId,
        placa: 'QWE1R23',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2022,
      })
      .expect(201);
    const veiculoId = veiculoResponse.body.id as string;

    const servicoResponse = await request(app.getHttpServer())
      .post('/servicos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Troca de oleo',
        descricao: 'Troca e filtro',
        precoEmCentavos: 20000,
      })
      .expect(201);
    const servicoId = servicoResponse.body.id as string;

    const pecaResponse = await request(app.getHttpServer())
      .post('/pecas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Filtro de oleo',
        precoEmCentavos: 5000,
        quantidadeEstoque: 3,
      })
      .expect(201);
    const pecaId = pecaResponse.body.id as string;

    const criarOS = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);
    const iniciarDiagnostico = new IniciarDiagnosticoUseCase(osRepo);
    const adicionarServico = new AdicionarServicoOSUseCase(osRepo, servicoRepo);
    const adicionarPeca = new AdicionarPecaOSUseCase(osRepo, pecaRepo);
    const gerarOrcamento = new GerarOrcamentoUseCase(osRepo);
    const enviarOrcamento = new EnviarOrcamentoParaAprovacaoUseCase(osRepo);
    const aprovarOrcamento = new AprovarOrcamentoUseCase(osRepo);
    const iniciarExecucao = new IniciarExecucaoUseCase(osRepo, pecaRepo);
    const finalizar = new FinalizarServicoUseCase(osRepo);
    const entregar = new EntregarVeiculoUseCase(osRepo);

    const osCriada = await criarOS.execute({ clienteId, veiculoId });
    await iniciarDiagnostico.execute({ osId: osCriada.id });
    await adicionarServico.execute({ osId: osCriada.id, servicoId });
    await adicionarPeca.execute({
      osId: osCriada.id,
      pecaId,
      quantidade: 2,
    });
    await gerarOrcamento.execute({ osId: osCriada.id });
    await enviarOrcamento.execute({ osId: osCriada.id });
    await aprovarOrcamento.execute({ osId: osCriada.id });
    await iniciarExecucao.execute({ osId: osCriada.id });
    await finalizar.execute({ osId: osCriada.id });
    await entregar.execute({ osId: osCriada.id });

    const pecaAposExecucao = await request(app.getHttpServer())
      .get(`/pecas/${pecaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(pecaAposExecucao.body.props.quantidadeEstoque.props.valor).toBe(1);

    const listaOs = await request(app.getHttpServer())
      .get('/ordens-servico')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listaOs.body).toHaveLength(1);
    expect(listaOs.body[0].props.status).toBe('ENTREGUE');

    const detalheOs = await request(app.getHttpServer())
      .get(`/ordens-servico/${osCriada.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(detalheOs.body.props.status).toBe('ENTREGUE');

    const consultaPublica = await request(app.getHttpServer())
      .get(`/consulta/os/${osCriada.codigoAcompanhamento}/status`)
      .expect(200);
    expect(consultaPublica.body.status).toBe('ENTREGUE');
  });
});
