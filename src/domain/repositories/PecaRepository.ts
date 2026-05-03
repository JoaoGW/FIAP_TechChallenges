import { Peca } from '../entities/Peca';

export interface PecaRepository {
  save(peca: Peca): Promise<void>;
  findById(id: string): Promise<Peca | null>;
  findAll(): Promise<Peca[]>;
}
