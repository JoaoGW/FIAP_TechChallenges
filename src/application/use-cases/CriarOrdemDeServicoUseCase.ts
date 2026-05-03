import { ClienteNaoEncontradoError } from '../../domain/errors/ClienteNaoEncontradoError';
import { VeiculoNaoEncontradoError } from '../../domain/errors/VeiculoNaoEncontradoError';
import { VeiculoNaoPertenceAoClienteError } from '../../domain/errors/VeiculoNaoPertenceAoClienteError';
import { OrdemDeServico } from '../../domain/entities/OrdemDeServico';
import { ClienteRepository } from '../../domain/repositories/ClienteRepository';
import { OrdemDeServicoRepository } from '../../domain/repositories/OrdemDeServicoRepository';
import { VeiculoRepository } from '../../domain/repositories/VeiculoRepository';

interface Input {
  clienteId: string;
  veiculoId: string;
}

interface Output {
  id: string;
  status: string;
  dataCriacao: Date;
}

export class CriarOrdemDeServicoUseCase {
  constructor(
    private readonly osRepo: OrdemDeServicoRepository,
    private readonly clienteRepo: ClienteRepository,
    private readonly veiculoRepo: VeiculoRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const cliente = await this.clienteRepo.findById(input.clienteId);
    if (!cliente) throw new ClienteNaoEncontradoError();

    const veiculo = await this.veiculoRepo.findById(input.veiculoId);
    if (!veiculo) throw new VeiculoNaoEncontradoError();

    if (veiculo.clienteId !== input.clienteId) {
      throw new VeiculoNaoPertenceAoClienteError();
    }

    const os = OrdemDeServico.criar(input.clienteId, input.veiculoId);

    await this.osRepo.save(os);

    return {
      id: os.getId(),
      status: os.status,
      dataCriacao: os.dataCriacao,
    };
  }
}
