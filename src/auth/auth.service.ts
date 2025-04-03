import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(name: string, email: string, password: string, role: string): Promise<{ message: string, user: any }> {
    // Verifica se o usuário já existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Cria e salva o novo usuário com o nome
    const user = new this.userModel({ 
      name,
      email, 
      password: hashedPassword ,
      role
    });

    await user.save();

    // Retorna os dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user.toObject();
    return { 
      message: 'Usuário registrado com sucesso!',
      user: userWithoutPassword
    };
  }

  async login(email: string, password: string): Promise<{ accessToken: string, user: any }> {
    const user = await this.userModel.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Cria o token JWT
    const payload = { 
      name: user.name,
      email: user.email, 
      role: user.role, // Adiciona a role no payload do JWT
      sub: user._id 
    };
    
    // Retorna o token e os dados básicos do usuário
    const { password: _, ...userWithoutPassword } = user.toObject();
    return { 
      accessToken: this.jwtService.sign(payload),
      user: userWithoutPassword
    };
  }
}
