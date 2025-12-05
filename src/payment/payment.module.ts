import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './models/payment.models';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../mail/mail.module';
import { ResetpasswordModule } from '../resetpassword/resetpassword.module';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/files/files.module';
import { OtpModule } from 'src/otp/otp.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment]),
    MailModule,
    ResetpasswordModule,
    JwtModule,
    FilesModule,
    OtpModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
