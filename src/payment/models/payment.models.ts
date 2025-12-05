import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Bsb } from 'src/bsb/models/bsb.model';
import { User } from 'src/user/models/user.models';

interface PaymentAttributes {
  amount: number;
  description: string;
  payer_reference: string,
  user_id: number;
  bsb_id: number;
  uuid: string;
  pay_url: string;
  status: boolean;
}

@Table({ tableName: 'payment' })
export class Payment extends Model<Payment, PaymentAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  uuid: string;

  @Column({
    type: DataType.STRING,
  })
  pay_url: string;

  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  payer_reference: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  status: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User[];


  @ForeignKey(() => Bsb)
  @Column({
    type: DataType.INTEGER,
  })
  bsb_id: number;

  @BelongsTo(() => Bsb)
  bsb: Bsb[];
}