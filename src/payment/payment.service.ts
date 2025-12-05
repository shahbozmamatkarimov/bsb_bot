import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from './models/payment.models';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { Op } from 'sequelize';
import { PaymentDto } from './dto/payment.dto';
import axios from 'axios';
import { Bsb } from 'src/bsb/models/bsb.model';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment) private paymentRepository: typeof Payment,
    private readonly jwtService: JwtService,
  ) { }

  async create(user_id: number, bsb_id: number): Promise<object> {
    try {
      console.log(process.env.PAYX_API_KEY);

      const paymentDto: PaymentDto = {
        amount: 2000,
        description: "Bsb tahlilini yuklab olish",
        payer_reference: String(user_id),
        user_id,
      }

      const res: any = await axios.post("https://backend.payx.uz/api/v1/invoice", paymentDto, {
        headers: {
          Authorization: "Bearer " + process.env.PAYX_API_KEY,
          "Accept-Language": 'uz',
        }
      });
      return this.paymentRepository.create({ ...paymentDto, uuid: res.data?.uuid, pay_url: res.data?.pay_url, bsb_id });
    } catch (error) {
      console.log(error);

      throw new BadRequestException(error.message);
    }
  }

  async processBalanceUpdate(data: any) {
    console.log(data);

    const payment_info = await this.paymentRepository.findOne({
      where: { uuid: data.transaction_id }
    })

    if (!payment_info) {
      throw new NotFoundException('Payment not found');
    }

    const update = await this.paymentRepository.update({ ...payment_info, status: true }, {
      where: { uuid: data.transaction_id },
      returning: true
    });

    return update[1][0]
  }

  async checkPaymentInfo(): Promise<object> {
    try {
      const payments = await this.paymentRepository.findAll({
        include: [{ model: Bsb }]
      });
      return payments;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async checkIsPayed(user_id: number, bsb_id: number) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { bsb_id },
        include: [{ model: Bsb }]
      });
      if (!payment) {
        return await this.create(user_id, bsb_id)
      }
      if (payment.status === true) {
        return true;
      }
      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(): Promise<object> {
    try {
      const payments = await this.paymentRepository.findAll();
      return {
        statusCode: HttpStatus.OK,
        data: payments,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: number): Promise<object> {
    try {
      let payment: any = await this.paymentRepository.findByPk(id);

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async pagination(page: number, limit: number): Promise<object> {
    try {
      const offset = (page - 1) * limit;
      const payments = await this.paymentRepository.findAll({ offset, limit });
      const total_count = await this.paymentRepository.count();
      const total_pages = Math.ceil(total_count / limit);
      const response = {
        statusCode: HttpStatus.OK,
        data: {
          records: payments,
          pagination: {
            currentPage: Number(page),
            total_pages,
            total_count,
          },
        },
      };
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async update(id: number, updateDto: UpdateDto): Promise<object> {
  //   try {
  //     const payment = await this.paymentRepository.findByPk(id);
  //     if (!payment) {
  //       throw new NotFoundException('Payment not found');
  //     }
  //     console.log(updateDto, id);
  //     const update = await this.paymentRepository.update(updateDto, {
  //       where: { id },
  //       returning: true,
  //     });
  //     console.log(update);
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Updated successfully',
  //       data: update[1][0],
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }
}