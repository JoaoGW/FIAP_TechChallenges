import { Servico } from '../../domain/entities/Servico';
import { Dinheiro } from '../../domain/value-objects/Dinheiro';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';

export class ServicoMapper {
  static toDomain(raw: any): Servico {
    return new Servico(
      {
        nome: raw.nome,
        descricao: raw.descricao,
        preco: new Dinheiro(raw.preco),
        ativo: raw.ativo ?? true,
        dataCriacao: raw.createdAt ? new Date(raw.createdAt) : new Date(),
        dataAtualizacao: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
