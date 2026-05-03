import { OrdemDeServico } from './OrdemDeServico';
import { StatusOS } from '../enums/StatusOS';
import { Dinheiro } from '../value-objects/Dinheiro';
import { Quantidade } from '../value-objects/Quantidade';
import { TransicaoStatusInvalidaError } from '../errors/TransicaoStatusInvalidaError';
import { OrcamentoNaoPodeSerGeradoError } from '../errors/OrcamentoNaoPodeSerGeradoError';
import { OrdemDeServicoSemServicoError } from '../errors/OrdemDeServicoSemServicoError';
import { ExecucaoNaoPodeSerIniciadaError } from '../errors/ExecucaoNaoPodeSerIniciadaError';

describe('OrdemDeServico - state machine', () => {
  it('deve iniciar com status RECEBIDA', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    expect(os.status).toBe(StatusOS.RECEBIDA);
  });

  it('deve transicionar RECEBIDA -> EM_DIAGNOSTICO', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    expect(os.status).toBe(StatusOS.EM_DIAGNOSTICO);
  });

  it('deve transicionar EM_DIAGNOSTICO -> AGUARDANDO_APROVACAO', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    expect(os.status).toBe(StatusOS.AGUARDANDO_APROVACAO);
  });

  it('deve transicionar AGUARDANDO_APROVACAO -> EM_EXECUCAO', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    expect(os.status).toBe(StatusOS.EM_EXECUCAO);
  });

  it('deve transicionar AGUARDANDO_APROVACAO -> EM_EXECUCAO com aprovarOrcamento', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.aprovarOrcamento();
    expect(os.status).toBe(StatusOS.EM_EXECUCAO);
  });

  it('deve transicionar EM_EXECUCAO -> FINALIZADA', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    os.finalizarServico();
    expect(os.status).toBe(StatusOS.FINALIZADA);
  });

  it('deve transicionar FINALIZADA -> ENTREGUE', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    os.finalizarServico();
    os.entregarVeiculo();
    expect(os.status).toBe(StatusOS.ENTREGUE);
  });

  it('deve lancar TransicaoStatusInvalidaError ao pular etapa', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    expect(() => os.enviarOrcamentoParaAprovacao()).toThrow(
      TransicaoStatusInvalidaError,
    );
  });

  it('deve lancar TransicaoStatusInvalidaError ao voltar etapa', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    expect(() => os.iniciarDiagnostico()).toThrow(TransicaoStatusInvalidaError);
  });

  it('nao deve permitir transicao a partir de ENTREGUE', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    os.finalizarServico();
    os.entregarVeiculo();
    expect(() => os.entregarVeiculo()).toThrow(TransicaoStatusInvalidaError);
  });

  it('deve preencher dataInicioExecucao ao iniciarExecucao', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    expect(os.dataInicioExecucao).toBeInstanceOf(Date);
  });

  it('deve lancar ExecucaoNaoPodeSerIniciadaError fora de AGUARDANDO_APROVACAO', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    expect(() => os.iniciarExecucao()).toThrow(ExecucaoNaoPodeSerIniciadaError);
  });

  it('deve preencher dataFinalizacao ao finalizarServico', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.enviarOrcamentoParaAprovacao();
    os.iniciarExecucao();
    os.finalizarServico();
    expect(os.dataFinalizacao).toBeInstanceOf(Date);
  });

  it('deve lancar OrcamentoNaoPodeSerGeradoError se status != EM_DIAGNOSTICO', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    expect(() => os.gerarOrcamento([])).toThrow(OrcamentoNaoPodeSerGeradoError);
  });

  it('deve lancar OrdemDeServicoSemServicoError se sem servicos', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    expect(() => os.gerarOrcamento([])).toThrow(OrdemDeServicoSemServicoError);
  });

  it('deve calcular valorTotal corretamente com servicos e pecas', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.adicionarServico('servico-1');
    os.adicionarPeca('peca-1', new Quantidade(2), new Dinheiro(8999));
    os.gerarOrcamento([new Dinheiro(15000)]);
    expect(os.valorTotal.centavos).toBe(32998);
  });

  it('deve retornar copias de itens e servicoIds', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.adicionarServico('servico-1');
    os.adicionarPeca('peca-1', new Quantidade(1), new Dinheiro(1000));

    const servicos = os.servicoIds;
    const itens = os.itens;

    servicos.push('servico-invalido');
    itens.pop();

    expect(os.servicoIds).toEqual(['servico-1']);
    expect(os.itens).toHaveLength(1);
  });

  it('deve atualizar dataAtualizacao ao alterar a OS', () => {
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    const antes = os.dataAtualizacao.getTime();

    os.adicionarServico('servico-1');

    expect(os.dataAtualizacao.getTime()).toBeGreaterThanOrEqual(antes);
  });
});
