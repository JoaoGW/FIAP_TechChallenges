import { Cliente } from '../../domain/entities/Cliente';
import { Documento } from '../../domain/value-objects/Documento';
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId';

export class ClienteMapper {
  static toDomain(raw: any): Cliente {
    return new Cliente(
      {
        nome: raw.nome,
        documento: new Documento(raw.documento),
        tipo: raw.tipo ?? (raw.documento?.length === 11 ? 'PF' : 'PJ'),
        contato: raw.contato ?? '',
        ativo: raw.ativo ?? true,
        dataCriacao: raw.createdAt ? new Date(raw.createdAt) : new Date(),
        dataAtualizacao: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      },
      new UniqueEntityId(raw.id),
    );
  }
}
