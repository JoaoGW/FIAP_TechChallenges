import { Peca } from '../../domain/entities/Peca';
import { Dinheiro } from '../../domain/value-objects/Dinheiro';
import { QuantidadeEstoque } from '../../domain/value-objects/QuantidadeEstoque';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';

export class PecaMapper {
  static toDomain(raw: any): Peca {
    return new Peca(
      {
        nome: raw.nome,
        preco: new Dinheiro(raw.preco),
        quantidadeEstoque: new QuantidadeEstoque(raw.quantidadeEstoque),
        ativo: raw.ativo ?? true,
        dataCriacao: raw.createdAt ? new Date(raw.createdAt) : new Date(),
        dataAtualizacao: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
