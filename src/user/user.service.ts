import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './models/user.models';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { generateToken } from '../utils/token';
import { LoginUserDto } from './dto/login.dto';
import { Op } from 'sequelize';
import { MailService } from '../mail/mail.service';
import { hash } from 'bcryptjs';
import * as uuid from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { UpdateDto } from './dto/update.dto';
import { omit } from 'lodash';
import { OtpService } from 'src/otp/otp.service';
import { VerifyOtpDto } from 'src/otp/dto/verifyOtp.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
  ) { }

  async register(
    registerUserDto: RegisterUserDto,
    type?: string,
  ): Promise<object> {
    try {
      const { phone, speacial_key } = registerUserDto;
      const existingUser = await this.userRepository.findOne({ where: { phone } });

      if (existingUser && speacial_key !== process.env.SPECIAL_KEY) {
        // throw new BadRequestException('Already registered');
        return { data: { user: existingUser }, message: 'Already registered' }
      } else if (existingUser && speacial_key === process.env.SPECIAL_KEY) {
        const user_data = await this.userRepository.update(
          { status: true, step: "2" },
          { where: { id: existingUser.id }, returning: true },
        );
        return {
          statusCode: HttpStatus.OK,
          message: 'Verification code sent successfully',
          data: {
            user: user_data[1][0],
          },
        };
      };

      const activation_link: string = uuid.v4();
      // let hashed_password: string;
      // if (password) {
      //   hashed_password = await hash(password, 7);
      // }

      const newUser = await this.userRepository.create({
        ...registerUserDto,
        // hashed_password,
        activation_link,
      });

      // await this.roleService.create({ user_id: newUser.id, role });

      const { access_token, refresh_token } = await generateToken(
        { id: newUser.id },
        this.jwtService,
      );

      const hashed_refresh_token = await hash(refresh_token, 7);
      await this.userRepository.update(
        { hashed_refresh_token },
        { where: { id: newUser.id } },
      );

      const user_data: any = await this.userRepository.findByPk(newUser.id, {
        attributes: { exclude: ['activation_link', 'hashed_password', 'status', 'hashed_refresh_token'] },
      });
      console.log("Hi2303");
      if (type != 'googleauth' && type != 'bot') {
        // await this.mailService.sendUserConfirmation(newUser, activation_link);
      }

      const token = type === 'googleauth' ? access_token : '';
      console.log("Hi2304");

      return {
        statusCode: HttpStatus.OK,
        message: 'Verification code sent successfully',
        data: {
          user: user_data,
          token,
        },
      };
    } catch (error) {
      console.log(error.message)
      throw new BadRequestException(error.message);
    }
  }

  async activateLink(activation_link: string) {
    if (!activation_link) {
      throw new BadRequestException('Activation link not found');
    }
    const user = await this.userRepository.findOne({
      where: { activation_link },
    });
    if (!user) {
      throw new BadRequestException('Activation link not found');
    } else if (user?.status) {
      throw new BadRequestException('User already activated');
    }
    const updateduser = await this.userRepository.update(
      { status: true, activation_link: "" },
      { where: { activation_link }, returning: true },
    );
    const { access_token, refresh_token } = await generateToken(
      { id: user.id },
      this.jwtService,
    );
    return {
      message: 'User activated successfully',
      user: updateduser[1][0],
      token: access_token,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    let user: any;
    const isVerified = await this.otpService.verifyOtp(verifyOtpDto, 'service');

    if (isVerified) {
      user = await this.userRepository.findOne({ where: { phone: verifyOtpDto.phone } });
    }

    const { access_token, refresh_token } = await generateToken(
      { id: user.id },
      this.jwtService,
    );
    return {
      message: 'User activated successfully',
      user,
      token: access_token,
    };
  }

  async login(
    loginUserDto: LoginUserDto,
    type?: string,
  ): Promise<object> {
    try {
      const { phone } = loginUserDto;
      const user = await this.userRepository.findOne({ where: { phone } });

      if (!user) {
        throw new NotFoundException('User not found');
      }


      // await this.mailService.sendUserConfirmation(updateuser[1][0], activation_link);
      // await this.botService.sendOtp(979201852, '4654')

      await this.otpService.sendOTP({ phone })
      return {
        statusCode: HttpStatus.OK,
        message: 'Verification code sended successfully',
        user,
      }
    } catch (error) {
      console.log(error);

      throw new BadRequestException("Foydalanuvchi topilmadi");
    }
  }

  async getAll(): Promise<object> {
    try {
      const users = await this.userRepository.findAll();
      return {
        statusCode: HttpStatus.OK,
        data: users,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getById(id: number): Promise<object> {
    try {
      let user: any = await this.userRepository.findByPk(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user = omit(user.toJSON(), [
        'hashed_password',
        'hashed_refresh_token',
        'activation_link',
        'status',
      ]);

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getByTelegramId(bot_id: number): Promise<object> {
    try {
      let user: any = await this.userRepository.findOne({
        where: { bot_id }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user = omit(user.toJSON(), [
        'hashed_password',
        'hashed_refresh_token',
        'activation_link',
        'status',
      ]);

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getByBotId(bot_id: number, type?: string): Promise<object> {
    try {
      const statusInclude = type == 'bot' ? { status: true } : {}
      let user: any = await this.userRepository.findOne({ where: { bot_id, ...statusInclude } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user = omit(user.toJSON(), [
        'hashed_password',
        'hashed_refresh_token',
        'activation_link',
      ]);

      return user;
    } catch (error) {
      if (type == 'bot' || type == 'botUser') {
        return null;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getUsersForAdmin(): Promise<object> {
    try {
      let user: any = await this.userRepository.findAll({ where: { step: "register" }, });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getByPhone(phone: string) {
    try {
      let user: any = await this.userRepository.findOne({ where: { phone } });

      if (!user) {
        // throw new NotFoundException('User not found');
        return 'User not found'
      }
      return user;
    } catch (error) {
      return { message: "Failed" }
    }
  }

  async getSuperAdmins() {
    try {
      let user: any = await this.userRepository.findAll({
        include: [{
          where: { role: 'super_admin' },
          required: true,
        }]
      });

      if (!user) {
        // throw new NotFoundException('User not found');
        // return 'User not found'
        return null;
      }
      return user;
    } catch (error) {
      return { message: "Failed" }
    }
  }

  async searchUsers(page: number, search: string): Promise<object> {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const whereClause = {
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { surname: { [Op.iLike]: `%${search}%` } },
          ],
        },
      }
      const users = await this.userRepository.findAll({
        ...whereClause,
        offset,
        limit,
      });
      const total_count = await this.userRepository.count({
        ...whereClause,
      });
      const total_pages = Math.ceil(total_count / limit);
      const response = {
        statusCode: HttpStatus.OK,
        data: {
          records: users,
          pagination: {
            currentPage: Number(page),
            total_pages,
            total_count,
          },
        },
      };
      return response;
    } catch (error) {
      throw new BadRequestException('Registration failed');
    }
  }

  async checkEmail(phone: string): Promise<object> {
    try {
      const user = await this.userRepository.findOne({
        where: { phone },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return {
        statusCode: HttpStatus.OK,
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async pagination(page: number, limit: number): Promise<object> {
    try {
      const offset = (page - 1) * limit;
      const users = await this.userRepository.findAll({ offset, limit });
      const total_count = await this.userRepository.count();
      const total_pages = Math.ceil(total_count / limit);
      const response = {
        statusCode: HttpStatus.OK,
        data: {
          records: users,
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

  async updateProfile(
    id: number,
    updateDto: UpdateDto,
    image: any
  ): Promise<object> {
    console.log(image);
    try {
      let user: any = await this.userRepository.findByPk(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (image) {
        if (user.image) {
          // await this.filesService.deleteFile(user.image);
        }
        // image = await this.filesService.createFile(image, 'image');
        updateDto.image = image.secure_url;
        console.log(updateDto.image)
        if (image == 'error') {
          return {
            status: HttpStatus.BAD_REQUEST,
            error: 'Error while uploading a file',
          };
        }
      } else {
        updateDto.image = null;
      }
      user = await this.userRepository.update(updateDto, {
        where: { id },
        returning: true,
      });
      return user[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updatePhone(
    id: number,
    bot_id: string,
    phone: string,
    step: string,
    status?: boolean,
  ): Promise<object> {
    try {
      let user: any = await this.userRepository.findByPk(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user = await this.userRepository.update({ phone, bot_id, status: status === false ? false : true, step }, {
        where: { id },
        returning: true,
      });
      return user[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateStep(
    id: number,
    step: string,
  ): Promise<object> {
    try {
      let user: any = await this.userRepository.findByPk(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user = await this.userRepository.update({ step }, {
        where: { id },
        returning: true,
      });
      return user[1][0];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async newPassword(newPasswordDto: NewPasswordDto): Promise<object> {
  //   try {
  //     const { new_password, activation_link } =
  //       newPasswordDto;
  //     const phone =
  //       await this.resetpasswordService.checkActivationLink(activation_link);
  //     const hashed_password = await hash(new_password, 7);
  //     const updated_info = await this.userRepository.update(
  //       { hashed_password },
  //       { where: { phone }, returning: true },
  //     );
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Password updated successfully',
  //       data: {
  //         user: updated_info[1][0],
  //       },
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // async updatePassword(password: string, phone: string): Promise<object> {
  //   try {
  //     const hashed_password = await hash(password, 7);
  //     const updated_info = await this.userRepository.update(
  //       { hashed_password },
  //       { where: { phone }, returning: true },
  //     );
  //     return updated_info[1][0]
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // async changeEmail(user_id: number, changeUserPhotoDto: ChangeUserPhoneDto): Promise<object> {
  //   try {
  //     const { phone, password, code } = changeUserPhotoDto;
  //     const user = await this.userRepository.findByPk(user_id);
  //     if (!user) {
  //       throw new BadRequestException("User not found");
  //     }
  //     await this.otpService.verifyOtp({ phone, code })

  //     const hashed_password = await hash(password, 7);
  //     const updated_info = await this.userRepository.update(
  //       { phone, hashed_password },
  //       { where: { phone: user.phone }, returning: true },
  //     );
  //     return updated_info[1][0]
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async forgotPassword(
    // phoneUserDto: PhoneUserDto,
  ) {
    // try {
    //   const { phone } = phoneUserDto;
    //   const activation_link: string = uuid.v4();

    //   const updated_info = await this.userRepository.update(
    //     { activation_link },
    //     { where: { phone }, returning: true },
    //   );
    //   await this.mailService.sendUserActivationLink(activation_link, phone);

    //   return {
    //     statusCode: HttpStatus.OK,
    //     message: "Emailingizga link yuborildi",
    //     data: {
    //       user: updated_info[1][0],
    //     },
    //   };
    // } catch (error) {
    //   throw new BadRequestException(error.message);
    // }
  }

  // async resetPassword(
  //   forgotPasswordDto: ForgotPasswordDto,
  // ): Promise<object> {
  //   try {
  //     const { activation_link, new_password } =
  //       forgotPasswordDto;
  //     const user = await this.userRepository.findOne({
  //       where: { activation_link }
  //     })
  //     const hashed_password = await hash(new_password, 7);
  //     const updated_info = await this.userRepository.update(
  //       { hashed_password },
  //       { where: { phone: user.phone }, returning: true },
  //     );
  //     return {
  //       message: "Paroli o'zgartirildi",
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }


  // async changePassword(
  //   user_id: number,
  //   changePasswordDto: ChangePasswordDto,
  // ): Promise<object> {
  //   try {
  //     const { old_password, new_password } =
  //       changePasswordDto;
  //     const user = await this.userRepository.findByPk(user_id);
  //     const isMatchPass = await bcrypt.compare(
  //       changePasswordDto.old_password,
  //       user.hashed_password,
  //     );
  //     if (!isMatchPass) {
  //       throw new BadRequestException('Password did not match!');
  //     }
  //     const hashed_password = await hash(new_password, 7);
  //     await this.userRepository.update(
  //       { hashed_password },
  //       { where: { phone: user.phone }, returning: true },
  //     );
  //     return {
  //       message: "Parolingiz o'zgartirildi",
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async update(id: number, updateDto: UpdateDto): Promise<object> {
    try {
      const user = await this.userRepository.findByPk(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      console.log(updateDto, id);
      const update = await this.userRepository.update(updateDto, {
        where: { id },
        returning: true,
      });
      console.log(update);
      return {
        statusCode: HttpStatus.OK,
        message: 'Updated successfully',
        data: update[1][0],
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteUser(id: string): Promise<object> {
    try {
      const user = await this.userRepository.findByPk(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.image) {
        // await this.filesService.deleteFile(user.image);
      }
      user.destroy();
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verify(token: string) {
    const client = new OAuth2Client(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const payload: any = ticket.getPayload();
    return payload;
  }

  async googleAuth(credential: string) {
    console.log(credential, 'credential');
    try {
      const payload: any = await this.verify(credential);
      console.log(payload);
      const data: any = {
        name: payload.given_name,
        surname: payload.family_name,
        password: credential,
        phone: payload.phone,
        status: true,
        role: 'student',
      };
      const is_user = await this.userRepository.findOne({
        where: {
          phone: payload.phone,
        },
      });
      let user: any;
      if (is_user) {
        user = await this.login(data, 'googleauth');
      } else {
        user = await this.register(data, 'googleauth');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async createDefaultUser() {
    try {
      await this.register({
        bot_id: process.env.INITIAL_BOTIT,
        full_name: process.env.INITIAL_NAME,
        phone: process.env.INITIAL_EMAIL,
        speacial_key: process.env.SPECIAL_KEY,
      });
    } catch { }
  }
}