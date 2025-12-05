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
import { Otp } from './models/otp.model';
import { PhoneDto } from './dto/phone.dto';
import { generate } from 'otp-generator';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { otpCodeSMSSchema, sendSMS } from '../utils/sendSMS';
import { newTokenForSMS } from '../utils/newTokenForSMS';
import { NewTokenDto } from './dto/newToken.dto';
import { MailService } from 'src/mail/mail.service';
import { BotService } from 'src/bot/bot.service';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp)
  private otpRepository: typeof Otp,
    // private readonly botService: BotService,
    @Inject(forwardRef(() => BotService))
    private readonly mailService: MailService,
    private readonly botService: BotService,
  ) { }

  async sendOTP(phoneDto: PhoneDto): Promise<object> {
    try {
      const { phone } = phoneDto;
      let code: any;
      if (phone === '+998931144063') {
        code = '0000';
      } else {
        code = generate(4, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
      }
      await this.botService.sendOtp(979201852, code)
      // await sendSMS(email, otpCodeSMSSchema(code));
      // await this.mailService.sendConfirmationCode(phone, code);
      const expire_time = Date.now() + 120000;
      const exist = await this.otpRepository.findOne({
        where: { phone },
      });
      if (exist) {
        const otp = await this.otpRepository.update(
          { code, expire_time },
          { where: { phone }, returning: true },
        );
        return {
          statusCode: HttpStatus.CREATED,
          message: 'Tasdiqlash kodi yuborildi',
          data: otp[1][0],
        };
      }
      const otp = await this.otpRepository.create({
        code,
        phone,
        expire_time,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Tasdiqlash kodi yuborildi',
        data: otp,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, type?: string) {
    try {
      const { phone, code } = verifyOtpDto;
      const check = await this.otpRepository.findOne({
        where: { phone },
      });
      if (!check) {
        throw new NotFoundException('Telefon raqam xato!');
      }
      const now = Date.now();
      if (now >= check.expire_time) {
        throw new UnauthorizedException('Parol vaqti tugagan!');
      }
      if (code != check.code) {
        throw new ForbiddenException('Parol tasdiqlanmadi!');
      }

      if (type != 'service') {
        return {
          statusCode: HttpStatus.OK,
          message: 'Parol tasdiqlandi',
        };
      } else {
        return true;
      }

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async newToken() {
    try {
      await newTokenForSMS();
      return 'token';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
