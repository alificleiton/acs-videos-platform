import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Param, 
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    @Query('search') search: string = '',
    @Query('role') role: string = ''
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
}
