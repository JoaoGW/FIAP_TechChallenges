import { StatusOS } from '../../../domain/enums/StatusOS';
import { OrdemDeServicoRepository } from '../../../domain/repositories/OrdemDeServicoRepository';

interface Input {
  page?: number;
  limit?: number;
  status?: string;
}

export class ListarOrdensDeServicoUseCase {
  constructor(private readonly osRepo: OrdemDeServicoRepository) {}

  async execute(input: Input = {}) {
    const ordens = await this.osRepo.findAll({
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      status: input.status,
    });

    const statusExcluidos = [
      StatusOS.FINALIZADA,
      StatusOS.ENTREGUE,
      StatusOS.CANCELADA,
    ];

    const prioridade: Record<StatusOS, number> = {
      [StatusOS.EM_EXECUCAO]: 1,
      [StatusOS.AGUARDANDO_APROVACAO]: 2,
      [StatusOS.EM_DIAGNOSTICO]: 3,
      [StatusOS.RECEBIDA]: 4,
      [StatusOS.FINALIZADA]: Number.MAX_SAFE_INTEGER,
      [StatusOS.ENTREGUE]: Number.MAX_SAFE_INTEGER,
      [StatusOS.CANCELADA]: Number.MAX_SAFE_INTEGER,
    };

    return ordens
      .filter((os) => !statusExcluidos.includes(os.status))
      .sort((ordemAtual, proximaOrdem) => {
        const diferencaPrioridade =
          prioridade[ordemAtual.status] - prioridade[proximaOrdem.status];
        if (diferencaPrioridade !== 0) return diferencaPrioridade;
        return (
          ordemAtual.dataCriacao.getTime() - proximaOrdem.dataCriacao.getTime()
        );
      });
  }
}
