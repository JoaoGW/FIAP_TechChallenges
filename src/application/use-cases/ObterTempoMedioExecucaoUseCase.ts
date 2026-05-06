import { OrdemDeServicoRepository } from '../../domain/repositories/OrdemDeServicoRepository';
import { OrdemDeServico } from '../../domain/entities/OrdemDeServico';

type OSFinalizada = OrdemDeServico & {
  dataInicioExecucao: Date;
  dataFinalizacao: Date;
};

export class ObterTempoMedioExecucaoUseCase {
  constructor(private readonly repo: OrdemDeServicoRepository) {}

  async execute(): Promise<{ mediaEmMinutos: number }> {
    const ordens = await this.repo.findAll();
    const finalizadas = ordens.filter(
      (os): os is OSFinalizada =>
        os.dataInicioExecucao !== undefined && os.dataFinalizacao !== undefined,
    );
    if (finalizadas.length === 0) return { mediaEmMinutos: 0 };
    const totalMs = finalizadas.reduce((acc, os) => {
      return (
        acc + (os.dataFinalizacao.getTime() - os.dataInicioExecucao.getTime())
      );
    }, 0);
    const mediaMs = totalMs / finalizadas.length;
    return {
      mediaEmMinutos: Math.round(mediaMs / 60000),
    };
  }
}
