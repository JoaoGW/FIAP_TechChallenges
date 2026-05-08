import { CriarOrdemDeServicoUseCase } from '../CriarOrdemDeServicoUseCase';
import { InMemoryClienteRepository } from '../fakes/InMemoryClienteRepository';
import { InMemoryOrdemDeServicoRepository } from '../fakes/InMemoryOrdemDeServicoRepository';
import { InMemoryVeiculoRepository } from '../fakes/InMemoryVeiculoRepository';
import { ClienteNaoEncontradoError } from '../../../domain/errors/ClienteNaoEncontradoError';
import { VeiculoNaoEncontradoError } from '../../../domain/errors/VeiculoNaoEncontradoError';
import { VeiculoNaoPertenceAoClienteError } from '../../../domain/errors/VeiculoNaoPertenceAoClienteError';
import { makeCliente, makeVeiculo } from './_helpers';
import { Documento } from '../../../domain/value-objects/Documento';
import { Cliente } from '../../../domain/entities/Cliente';

describe('CriarOrdemDeServicoUseCase', () => {
  it('deve falhar se cliente nao existir', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const clienteRepo = new InMemoryClienteRepository();
    const veiculoRepo = new InMemoryVeiculoRepository();
    const useCase = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);

    const cliente = makeCliente();
    const veiculo = makeVeiculo(cliente.getId());
    await veiculoRepo.save(veiculo);

    await expect(
      useCase.execute({ clienteId: cliente.getId(), veiculoId: veiculo.getId() }),
    ).rejects.toBeInstanceOf(ClienteNaoEncontradoError);
  });

  it('deve falhar se veiculo nao existir', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const clienteRepo = new InMemoryClienteRepository();
    const veiculoRepo = new InMemoryVeiculoRepository();
    const useCase = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);

    const cliente = makeCliente();
    await clienteRepo.save(cliente);

    await expect(
      useCase.execute({ clienteId: cliente.getId(), veiculoId: 'veiculo-inexistente' }),
    ).rejects.toBeInstanceOf(VeiculoNaoEncontradoError);
  });

  it('deve falhar se veiculo nao pertencer ao cliente', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const clienteRepo = new InMemoryClienteRepository();
    const veiculoRepo = new InMemoryVeiculoRepository();
    const useCase = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);

    const clienteA = makeCliente();
    const clienteB = Cliente.criar(
      'Cliente B',
      new Documento('11144477735'),
      'PF',
    );
    await clienteRepo.save(clienteA);
    await clienteRepo.save(clienteB);

    const veiculo = makeVeiculo(clienteB.getId());
    await veiculoRepo.save(veiculo);

    await expect(
      useCase.execute({ clienteId: clienteA.getId(), veiculoId: veiculo.getId() }),
    ).rejects.toBeInstanceOf(VeiculoNaoPertenceAoClienteError);
  });

  it('deve criar OS valida com status inicial RECEBIDA', async () => {
    const osRepo = new InMemoryOrdemDeServicoRepository();
    const clienteRepo = new InMemoryClienteRepository();
    const veiculoRepo = new InMemoryVeiculoRepository();
    const useCase = new CriarOrdemDeServicoUseCase(osRepo, clienteRepo, veiculoRepo);

    const cliente = makeCliente();
    const veiculo = makeVeiculo(cliente.getId());
    await clienteRepo.save(cliente);
    await veiculoRepo.save(veiculo);

    const output = await useCase.execute({
      clienteId: cliente.getId(),
      veiculoId: veiculo.getId(),
    });

    expect(output.id).toBeDefined();
    expect(output.codigoAcompanhamento).toMatch(/^OS-\d{4}-[A-Z0-9]{6}$/);
    expect(output.status).toBe('RECEBIDA');
    expect(output.dataCriacao).toBeInstanceOf(Date);
    expect(osRepo.items).toHaveLength(1);
  });
});
