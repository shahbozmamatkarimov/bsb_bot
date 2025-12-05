import { forwardRef, Module } from '@nestjs/common';
import { BsbController } from './bsb.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailModule } from 'src/mail/mail.module';
import { BotModule } from 'src/bot/bot.module';
import { UserModule } from 'src/user/user.module';
import { Bsb } from './models/bsb.model';
import { BsbService } from './bsb.service';
import { PaymentModule } from 'src/payment/payment.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([Bsb]), PaymentModule, JwtModule,],
  controllers: [BsbController],
  providers: [BsbService],
  exports: [BsbService],
})
export class BsbModule { }
