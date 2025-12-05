import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface BsbAttributes {
  id: number;
  district: number;
  quarter: number;
  subject: number;
  class: string;
  questions_count: number;
  question_ball: any;
  user_ball: any;
  totalPercentOfColumn: any;
  avaragePercentage: number;
  countSum: number;
}

@Table({ tableName: 'bsb' })
export class Bsb extends Model<Bsb, BsbAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
  })
  district: number;

  @Column({
    type: DataType.INTEGER,
  })
  quarter: number;

  @Column({
    type: DataType.INTEGER,
  })
  subject: number;

  @Column({
    type: DataType.STRING,
  })
  class: string;

  @Column({
    type: DataType.INTEGER,
  })
  questions_count: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  question_ball: any;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  user_ball: any;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  user_list: any;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  totalPercentOfColumn: any;


  @Column({
    type: DataType.INTEGER,
  })
  avaragePercentage: number;

  @Column({
    type: DataType.INTEGER,
  })
  countSum: number;
}
