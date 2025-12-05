import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/user.module';
import { UploadedModule } from './uploaded/uploaded.module';
import { NotificationModule } from './notification/notification.module';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ResetpasswordModule } from './resetpassword/resetpassword.module';
import { UserService } from './user/user.service';
import { User } from './user/models/user.models';
import { Uploaded } from './uploaded/models/uploaded.models';
import { Notification } from './notification/models/notification.model';
import { TelegrafModule } from 'nestjs-telegraf';
// import { BOT_NAME } from './app.constants';
import { BotModule } from './bot/bot.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MyService } from './schedules/schedule.service';
import { BOT_NAME } from './app.constants';
import { Bot } from './bot/models/bot.model';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import pg from "pg"
import { Otp } from './otp/models/otp.model';
import { Payment } from './payment/models/payment.models';
import { PaymentModule } from './payment/payment.module';
import { BsbModule } from './bsb/bsb.module';
import { Bsb } from './bsb/models/bsb.model';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => {
        return process.env.NODE_ENV === 'production' ? {
          token: process.env.BOT_TOKEN,
          includes: [BotModule],
          // launchOptions: {
          //   webhook: {
          //     domain: 'https://vercelbackend-production.up.railway.app',
          //     hookPath: '/api/webhook',
          //   }
          // }
        } : { 
          token: process.env.BOT_TOKEN,
          // includes: [BotModule],
          launchOptions: {
            webhook: {
              domain: 'https://bsb-bot.vercel.app',
              hookPath: '/api/webhook/bot',
            }
          }
        }
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.PGHOST,
      // port: Number(process.env.PG_PORT),
      username: process.env.PGUSER,
      password: String(process.env.PGPASSWORD),
      database: process.env.PGDATABASE,
      models: [
        User,
        Uploaded,
        Notification,
        Bot,
        Otp,
        Payment,
        Bsb,
      ],
      // autoLoadModels: true,
      // synchronize: true,
      // sync: { alter: true },
      logging: false, 
      dialectModule: pg,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    JwtModule.register({ global: true }),
    MailModule,
    FilesModule,
    UserModule,
    UploadedModule,
    NotificationModule,
    OtpModule,
    CloudinaryModule,
    ResetpasswordModule,
    BotModule,
    OtpModule,
    PaymentModule,
    BsbModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MyService,
  ],
  exports: []
})
export class AppModule implements OnApplicationBootstrap {

  constructor(
    private readonly userService: UserService,
  ) { }

  async onApplicationBootstrap() {
    await this.userService.createDefaultUser();
    // ConsoleUtils.startAutoClear();
  }

}