import { OrdemDeServico } from '../../../domain/entities/OrdemDeServico';
import { StatusOS } from '../../../domain/enums/StatusOS';
import { OrdemDeServicoNaoEncontradaError } from '../../../domain/errors/OrdemDeServicoNaoEncontradaError';
import { Dinheiro } from '../../../domain/value-objects/Dinheiro';
import { InMemoryOrdemDeServicoRepository } from '../fakes/InMemoryOrdemDeServicoRepository';
import { RecusarOrcamentoUseCase } from '../RecusarOrcamentoUseCase';

describe('RecusarOrcamentoUseCase', () => {
  it('deve recusar orcamento com sucesso', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new RecusarOrcamentoUseCase(osRepo);
    const os = OrdemDeServico.criar('cliente-1', 'veiculo-1');
    os.iniciarDiagnostico();
    os.adicionarServico('servico-1', new Dinheiro(12000));
    os.gerarOrcamento();
    os.enviarOrcamentoParaAprovacao();
    await osRepo.save(os);

    await useCase.execute({ osId: os.getId() });

    const osAtualizada = await osRepo.findById(os.getId());
    expect(osAtualizada?.status).toBe(StatusOS.CANCELADA);
  });

  it('deve lancar OrdemDeServicoNaoEncontradaError para OS inexistente', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new RecusarOrcamentoUseCase(osRepo);

    await expect(
      useCase.execute({ osId: 'os-inexistente' }),
    ).rejects.toBeInstanceOf(OrdemDeServicoNaoEncontradaError);
  });
});
