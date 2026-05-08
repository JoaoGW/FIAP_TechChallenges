import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CriarOrdemDeServicoDto {
  @ApiProperty({ example: 'cliente-uuid' })
  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @ApiProperty({ example: 'veiculo-uuid' })
  @IsString()
  @IsNotEmpty()
  veiculoId: string;
}
