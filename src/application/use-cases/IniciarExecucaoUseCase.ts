import { EstoqueInsuficienteError } from '../../domain/errors/EstoqueInsuficienteError';
import { OrdemDeServicoNaoEncontradaError } from '../../domain/errors/OrdemDeServicoNaoEncontradaError';
import { PecaNaoEncontradaError } from '../../domain/errors/PecaNaoEncontradaError';
import { Peca } from '../../domain/entities/Peca';
import { OrdemDeServicoRepository } from '../../domain/repositories/OrdemDeServicoRepository';
import { PecaRepository } from '../../domain/repositories/PecaRepository';

interface Input {
  osId: string;
}

export class IniciarExecucaoUseCase {
  constructor(
    private readonly osRepo: OrdemDeServicoRepository,
    private readonly pecaRepo: PecaRepository,
  ) {}

  async execute(input: Input): Promise<void> {
    const os = await this.osRepo.findById(input.osId);
    if (!os) throw new OrdemDeServicoNaoEncontradaError();

    const pecasPorId = new Map<string, Peca>();

    for (const item of os.itens) {
      const peca = await this.pecaRepo.findById(item.pecaId);
      if (!peca) throw new PecaNaoEncontradaError();
      if (peca.quantidadeEstoque < item.quantidade.valor) {
        throw new EstoqueInsuficienteError();
      }
      pecasPorId.set(item.pecaId, peca);
    }

    for (const item of os.itens) {
      const peca = pecasPorId.get(item.pecaId);
      if (!peca) throw new PecaNaoEncontradaError();

      peca.baixarEstoque(item.quantidade);
      await this.pecaRepo.save(peca);
    }

    os.iniciarExecucao();
    await this.osRepo.save(os);
  }
}
