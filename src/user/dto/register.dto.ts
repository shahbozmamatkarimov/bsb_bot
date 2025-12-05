import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    example: 4564,
    description: 'Bot id',
  })
  @IsNotEmpty()
  @IsNumber()
  bot_id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of user',
  })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({
    example: true,
    description: 'User status',
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean; 

  @ApiProperty({
    example: '+998991422303',
    description: 'Phone number',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    example: 'speacial_key',
    description: 'speacial_key',
  })
  @IsOptional()
  @IsString()
  speacial_key?: string;
}