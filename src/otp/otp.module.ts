import { forwardRef, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Otp } from './models/otp.model';
import { MailModule } from 'src/mail/mail.module';
import { BotModule } from 'src/bot/bot.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([Otp]), MailModule, forwardRef(() => BotModule),],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
