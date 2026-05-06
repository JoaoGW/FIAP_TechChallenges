import { EnviarOrcamentoParaAprovacaoUseCase } from '../EnviarOrcamentoParaAprovacaoUseCase';
import { InMemoryOrdemDeServicoRepository } from '../fakes/InMemoryOrdemDeServicoRepository';
import { OrdemDeServicoNaoEncontradaError } from '../../../domain/errors/OrdemDeServicoNaoEncontradaError';
import { OrcamentoNaoGeradoError } from '../../../domain/errors/OrcamentoNaoGeradoError';
import { OrdemDeServico } from '../../../domain/entities/OrdemDeServico';
import { Dinheiro } from '../../../domain/value-objects/Dinheiro';

describe('EnviarOrcamentoParaAprovacaoUseCase', () => {
  it('deve falhar se OS nao existir', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new EnviarOrcamentoParaAprovacaoUseCase(osRepo);

    await expect(useCase.execute({ osId: 'os-inexistente' })).rejects.toBeInstanceOf(
      OrdemDeServicoNaoEncontradaError,
    );
  });

  it('deve falhar se orcamento nao tiver sido gerado', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new EnviarOrcamentoParaAprovacaoUseCase(osRepo);
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.adicionarServico('servico-1', new Dinheiro(12000));
    await osRepo.save(os);

    await expect(useCase.execute({ osId: os.getId() })).rejects.toBeInstanceOf(
      OrcamentoNaoGeradoError,
    );
  });

  it('deve enviar orcamento para aprovacao com sucesso', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new EnviarOrcamentoParaAprovacaoUseCase(osRepo);
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.adicionarServico('servico-1', new Dinheiro(12000));
    os.gerarOrcamento();
    await osRepo.save(os);

    await useCase.execute({ osId: os.getId() });

    const saved = await osRepo.findById(os.getId());
    expect(saved?.status).toBe('AGUARDANDO_APROVACAO');
  });
});
