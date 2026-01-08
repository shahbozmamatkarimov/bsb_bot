import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Headers,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { UpdateDto } from './dto/update.dto';
import { extractUserIdFromToken } from 'src/utils/token';
import { JwtService } from '@nestjs/jwt';
import { ImageValidationPipe } from 'src/pipes/image-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyOtpDto } from 'src/otp/dto/verifyOtp.dto';
// import { ChangeUserPhoneDto } from './dto/change-email.dto';
// import { PhoneUserDto } from './dto/phone.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
  ) { }

  @ApiOperation({ summary: 'Registration a new user' })
  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ) {
    const data = await this.userService.register(registerUserDto);
    return data;
  }

  @Get('activation_link/:activation_link')
  activate(@Param('activation_link') activation_link: string) {
    return this.userService.activateLink(activation_link);
  }

  @ApiOperation({ summary: 'Login user with send OTP' })
  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
  ) {
    return this.userService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Login user with send OTP' })
  @Post('verify-otp')
  verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ) {
    return this.userService.verifyOtp(verifyOtpDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  // @UseGuards(AuthGuard)
  @Get('getByRole/:role')
  getAll(@Param('role') role: string) {
    return this.userService.getAll();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  // @UseGuards(AuthGuard)
  @Get('/:id')
  getById(@Param('id') id: number) {
    return this.userService.getById(id);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  // @UseGuards(AuthGuard)
  @Get('/getByTelegramId/:id')
  getByTelegramId(@Param('id') id: number) {
    return this.userService.getByTelegramId(id);
  }

  @ApiOperation({ summary: 'Get users with pagination' })
  // @UseGuards(AuthGuard)
  @Get('pagination/:page/:limit')
  pagination(@Param('page') page: number, @Param('limit') limit: number) {
    return this.userService.pagination(page, limit);
  }

  @ApiOperation({ summary: 'Get users with pagination' })
  // @UseGuards(AuthGuard)
  @Get('searchusers/:search/:page')
  searchUsers(@Param('page') page: number, @Param('search') search: string) {
    return this.userService.searchUsers(page, search);
  }

  @ApiOperation({ summary: 'Get users with pagination' })
  // @UseGuards(AuthGuard)
  @Get('checkemail/:email')
  checkEmail(@Param('email') email: string) {
    return this.userService.checkEmail(email);
  }

  // @ApiOperation({ summary: 'New password of user' })
  // // @UseGuards(AuthGuard)
  // @Put('/newPassword')
  // newPassword(@Body() newPasswordDto: NewPasswordDto) {
  //   return this.userService.newPassword(newPasswordDto);
  // }

  @ApiOperation({ summary: 'Update user profile by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        surname: {
          type: 'string',
        },
        bio: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Put('profile')
  updateProfile(
    @Body() updateDto: UpdateDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
    @Headers() headers?: string) {
    const user_id = extractUserIdFromToken(headers, this.jwtService, true);
    console.log("HI")
    return this.userService.updateProfile(user_id, updateDto, image);
  }

  @ApiOperation({ summary: 'Forgot password for user' })
  // @UseGuards(AuthGuard)
  @Post('forgot-password')
  forgotPassword(
    // @Param('id') id: string,
    // @Body() emailUserDto: PhoneUserDto,
  ) {
    // return this.userService.forgotPassword(emailUserDto);
  }

  // @ApiOperation({ summary: 'Forgot password for user' })
  // // @UseGuards(AuthGuard)
  // @Post('reset-password')
  // resetPassword(
  //   // @Param('id') id: string,
  //   @Body() forgotPasswordDto: ForgotPasswordDto,
  // ) {
  //   return this.userService.resetPassword(forgotPasswordDto);
  // }

  // @ApiOperation({ summary: 'Forgot password for user' })
  // // @UseGuards(AuthGuard)
  // @Post('change-password')
  // changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @Headers() headers?: string
  // ) {
  //   const user_id = extractUserIdFromToken(headers, this.jwtService, true);
  //   return this.userService.changePassword(user_id, changePasswordDto);
  // }

  // @ApiOperation({ summary: 'Change user email by ID' })
  // // @UseGuards(AuthGuard)
  // @Put('change-email')
  // changeEmail(
  //   @Body() changeUserPhoneeDto: ChangeUserPhoneDto,
  //   @Headers() headers?: string
  // ) {
  //   const user_id = extractUserIdFromToken(headers, this.jwtService, true);
  //   // return this.userService.changeEmail(user_id, changeUserPhoneeDto);
  // }

  @ApiOperation({ summary: 'Delete user by ID' })
  // @UseGuards(AuthGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  // @UseGuards(AuthGuard)
  @Post('/auth/google')
  googleAuth(
    @Body() { credential }: { credential: string },
  ) {
    return this.userService.googleAuth(credential);
  }
}