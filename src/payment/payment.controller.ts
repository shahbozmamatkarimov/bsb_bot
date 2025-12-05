import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentDto } from './dto/payment.dto';
import { JwtService } from '@nestjs/jwt';
import { extractUserIdFromToken } from 'src/utils/token';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly jwtService: JwtService,
  ) { }

  @ApiOperation({ summary: 'Registration a new payment' })
  @Post('invoice')
  async invoice(
    @Body() { bsb_id }: { bsb_id: number },
    @Headers() headers?: string,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, false);
    return this.paymentService.create(user_id, bsb_id);
  }

  @ApiOperation({ summary: 'Get all payments' })
  // @UseGuards(AuthGuard)
  @Get('info/:id')
  checkIsPayed(
    @Param('id') id: number,
    @Headers() headers?: string,
  ) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, false);

    return this.paymentService.checkIsPayed(user_id, id);
  }

  @ApiOperation({ summary: 'Get all payments' })
  // @UseGuards(AuthGuard)
  @Get('getByRole/:role')
  getAll(@Param('role') role: string) {
    return this.paymentService.getAll();
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  // @UseGuards(AuthGuard)
  @Get('/info')
  checkPaymentInfo() {
    return this.paymentService.checkPaymentInfo();
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  // @UseGuards(AuthGuard)
  @Get('/:id')
  getById(@Param('id') id: number) {
    return this.paymentService.getById(id);
  }


  @ApiOperation({ summary: 'Get payment by ID' })
  // @UseGuards(AuthGuard)
  @Post('/webhook')
  handleBalanceUpdate(@Body() data: any, @Headers('authorization') authHeader: string,) {
    // 1) Authorization tekshirish
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.slice(7);
    const expected = process.env.PAYX_API_KEY || 'MY_PROJECT_TOKEN';

    if (token !== expected) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    // 3) Service-ni chaqiramiz
    return this.paymentService.processBalanceUpdate(data);
  }

  @ApiOperation({ summary: 'Get payments with pagination' })
  // @UseGuards(AuthGuard)
  @Get('pagination/:page/:limit')
  pagination(@Param('page') page: number, @Param('limit') limit: number) {
    return this.paymentService.pagination(page, limit);
  }
}