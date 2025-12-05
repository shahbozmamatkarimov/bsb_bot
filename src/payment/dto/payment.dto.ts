import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentDto {
  // @ApiProperty({
  //   example: 15000,
  //   description: 'Amount of payment',
  // })
  // @IsNotEmpty()
  // @IsNumber()
  // amount: number;

  // @ApiProperty({
  //   example: 'Subscribe to a course',
  //   description: 'Description of payment',
  // })
  // @IsNotEmpty()
  // @IsString()
  // description: string;

  // @ApiProperty({
  //   example: '1',
  //   description: 'payer_reference of payment',
  // })
  // @IsOptional()
  // @IsString()
  // payer_reference: string;
}
