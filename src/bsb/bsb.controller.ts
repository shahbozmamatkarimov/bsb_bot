import { Controller, Post, Body, Headers, Param, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BsbDto } from './dto/bsb.dto';
import { BsbService } from './bsb.service';
import { extractUserIdFromToken } from 'src/utils/token';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Bsb')
@Controller('bsb')
export class BsbController {
  constructor(
    private readonly bsbService: BsbService,
    private readonly jwtService: JwtService,
  ) { }

  @ApiOperation({ summary: 'Create' })
  @Post('create')
  create(
    @Body() bsbDto: BsbDto,
    @Headers() headers?: string,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, false);
    return this.bsbService.create(bsbDto, user_id);
  }

  @ApiOperation({ summary: 'Create' })
  @Get('/:id')
  getById(
    @Param('id') id: number,
    @Headers() headers?: string,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, false);
    return this.bsbService.getById(id);
  }

  @ApiOperation({ summary: 'Create' })
  @Put('update/:id')
  update(
    @Param('id') id: number,
    @Body() bsbDto: BsbDto,
    @Headers() headers?: string,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, false);
    return this.bsbService.update(id, bsbDto, user_id);
  }

}
