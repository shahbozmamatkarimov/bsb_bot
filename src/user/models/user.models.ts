import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

interface UserAttributes {
  bot_id: string;
  full_name: string;
  username: string,
  phone: string;
  limit: number;
  bio: string;
  image: string;
  step: string,
  status: boolean;
  activation_link: string;
  hashed_refresh_token: string;
}

export enum RoleName {
  client = 'client',
  salesman = 'salesman',
  admin = 'admin',
  super_admin = 'super_admin'
}

@Table({ tableName: 'user' })
export class User extends Model<User, UserAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.BIGINT,
  })
  bot_id: string;

  @Column({
    type: DataType.STRING,
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
  })
  username: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  phone: string;

  @Column({
    type: DataType.INTEGER,
  })
  limit: number;

  @Column({
    type: DataType.TEXT,
  })
  bio: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 1,
  })
  step: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  status: boolean;

  @Column({
    type: DataType.STRING,
  })
  activation_link: string;

  @Column({
    type: DataType.STRING,
  })
  hashed_refresh_token: string;
}