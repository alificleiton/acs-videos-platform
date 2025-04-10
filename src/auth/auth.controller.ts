import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Param, 
  UseGuards,
  NotFoundException,Put, Delete,
  UseInterceptors, UploadedFile,
  Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadUserAvatarService } from './upload-user-avatar.service';
import { UpdateProfileDto } from './update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly avatarService: UploadUserAvatarService
  ) {}
  

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; role: string }
  ) {
    return this.authService.register(body.name, body.email, body.password, body.role);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string }
  ) {
    return this.authService.login(body.email, body.password);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
    @Query('role') role: string
  ) {
    return this.authService.findAllUsers(page, limit, search, role);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { name?: string; email?: string; role?: string ; avatarUrl?: string }
  ) {
    const updatedUser = await this.authService.updateUser(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return updatedUser;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.authService.deleteUser(id);
    if (!result.deleted) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { message: 'Usuário removido com sucesso' };
  }

  @Post('google-login')
  async googleLogin(
    @Body() body: { name: string; email: string , avatarUrl?: string}
  ) {
    return this.authService.googleLogin(body.name, body.email , body.avatarUrl);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const userId = req.user.sub;
    return this.avatarService.uploadAvatar(userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() data: UpdateProfileDto,
    @Req() req
  ) {
    const userId = req.user.sub;

    let avatarUrl: string | undefined;

    if (avatar) {
      try {
        const result = await this.avatarService.uploadAvatar(userId, avatar);
        avatarUrl = result.avatarUrl;
      } catch (err) {
        throw new NotFoundException('Erro ao fazer upload da imagem');
      }
    }

    return this.authService.updateUser(userId, {
      ...data,
      ...(avatarUrl && { avatarUrl }),
    });
  }
  
}
