import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '../../swagger/swagger.decorators';

export class AtualizarClienteDto {
  @ApiPropertyOptional({ example: 'Joao Pedro da Silva' })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsString()
  @IsOptional()
  contato?: string;
}
