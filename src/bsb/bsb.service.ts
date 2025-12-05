import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bsb } from './models/bsb.model';
import { BsbDto } from './dto/bsb.dto';
import { generate } from 'otp-generator';
import { otpCodeSMSSchema, sendSMS } from '../utils/sendSMS';
import { newTokenForSMS } from '../utils/newTokenForSMS';
import { MailService } from 'src/mail/mail.service';
import { BotService } from 'src/bot/bot.service';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class BsbService {
  constructor(@InjectModel(Bsb)
  private bsbRepository: typeof Bsb,
    private paymentService: PaymentService,
  ) { }

  async create(bsbDto: BsbDto, user_id: number): Promise<object> {
    try {
      const bsb: any = await this.bsbRepository.create(bsbDto);
      return this.paymentService.create(user_id, bsb.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: number): Promise<object> {
    try {
      const bsb: any = await this.bsbRepository.findByPk(id);
      if (!bsb) {
        throw new NotFoundException("Bsb not found!");
      }

      return bsb;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, bsbDto: BsbDto, user_id: number): Promise<object> {
    try {
      let bsb: any = await this.bsbRepository.findByPk(id);
      if (!bsb) {
        throw new NotFoundException("Bsb not found!");
      }
      bsb = await this.bsbRepository.update({ ...bsb, ...bsbDto }, {
        where: { id },
        returning: true,
      });
      return bsb[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
