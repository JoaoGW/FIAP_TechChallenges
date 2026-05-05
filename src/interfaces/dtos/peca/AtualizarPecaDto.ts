import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '../../swagger/swagger.decorators';

export class AtualizarPecaDto {
  @ApiPropertyOptional({ example: 'Filtro de oleo premium' })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Preco em centavos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  precoEmCentavos?: number;
}
