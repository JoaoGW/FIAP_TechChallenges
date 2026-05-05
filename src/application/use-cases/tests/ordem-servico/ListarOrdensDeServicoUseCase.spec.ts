import { StatusOS } from '../../../../domain/enums/StatusOS';
import { OrdemDeServico } from '../../../../domain/entities/OrdemDeServico';
import { InMemoryOrdemDeServicoRepository } from '../../fakes/InMemoryOrdemDeServicoRepository';
import { ListarOrdensDeServicoUseCase } from '../../ordem-servico/ListarOrdensDeServicoUseCase';
import { CriarOrdemDeServicoUseCase } from '../../CriarOrdemDeServicoUseCase';
import { InMemoryClienteRepository } from '../../fakes/InMemoryClienteRepository';
import { InMemoryVeiculoRepository } from '../../fakes/InMemoryVeiculoRepository';
import { makeCliente, makeVeiculo } from '../_helpers';

describe('ListarOrdensDeServicoUseCase', () => {
  it('deve retornar lista vazia quando nao houver OS', async () => {
    const repo = new InMemoryOrdemDeServicoRepository();
    const useCase = new ListarOrdensDeServicoUseCase(repo);

    const result = await useCase.execute();
    expect(result).toHaveLength(0);
  });

  it('deve listar OS com dados', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const clienteRepo = new InMemoryClienteRepository();
    const veiculoRepo = new InMemoryVeiculoRepository();
    const criarOs = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);
    const useCase = new ListarOrdensDeServicoUseCase(osRepo);
    const cliente = makeCliente();
    await clienteRepo.save(cliente);
    const veiculo = makeVeiculo(cliente.getId());
    await veiculoRepo.save(veiculo);

    await criarOs.execute({ clienteId: cliente.getId(), veiculoId: veiculo.getId() });

    const result = await useCase.execute();
    expect(result).toHaveLength(1);
  });

  it('deve filtrar por status', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const useCase = new ListarOrdensDeServicoUseCase(osRepo);
    const os1 = OrdemDeServico.criar('c1', 'v1');
    const os2 = OrdemDeServico.criar('c2', 'v2');
    os2.iniciarDiagnostico();
    await osRepo.save(os1);
    await osRepo.save(os2);

    const filtradas = await useCase.execute({ status: StatusOS.EM_DIAGNOSTICO });
    expect(filtradas).toHaveLength(1);
    expect(filtradas[0].status).toBe(StatusOS.EM_DIAGNOSTICO);
  });
});
