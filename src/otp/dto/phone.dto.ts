import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class PhoneDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsNumber()
  bot_id: number;
  
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email of user',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
