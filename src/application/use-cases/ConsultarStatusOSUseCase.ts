import { OrdemDeServicoRepository } from '../../domain/repositories/OrdemDeServicoRepository';

export class ConsultarStatusOSUseCase {
  constructor(private readonly repo: OrdemDeServicoRepository) {}

  async execute(id: string) {
    const os = await this.repo.findById(id);
    if (!os) throw new Error('OS não encontrada');
    return {
      id: os.getId(),
      status: os.status,
      dataAtualizacao: os.dataAtualizacao,
    };
  }
}
