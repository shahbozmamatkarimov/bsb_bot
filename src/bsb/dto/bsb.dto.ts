import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class BsbDto {
  @ApiProperty({
    example: '1',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  district: number;

  @ApiProperty({
    example: '1',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  quarter: number;

  @ApiProperty({
    example: 'Ona tili',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  subject: number;

  @ApiProperty({
    example: '1',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({
    example: 5,
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  questions_count: number;

  @ApiProperty({
    example: [1,2,3],
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsArray()
  question_ball: any;


  @ApiProperty({
    example: [['1', '2', '3']],
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsArray()
  user_ball: any;


  @ApiProperty({
    example: ['1', '2', '3'],
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsArray()
  user_list: any;

  @ApiProperty({
    example: [5, 5, 5],
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsArray()
  totalPercentOfColumn: any;

  @ApiProperty({
    example: 45,
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  avaragePercentage: number;

  @ApiProperty({
    example: 45,
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  countSum: number;
}
