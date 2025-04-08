import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { randomBytes } from 'crypto';
import { UserService } from './user.service'; // <-- Importa
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {
  
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,    
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailService: MailerService, // <-- injeta isso
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
      role,
      avatarUrl: '' // avatar vazio inicialmente
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
      avatarUrl: user.avatarUrl,
      sub: user._id 
    };
    
    // Retorna o token e os dados básicos do usuário
    const { password: _, ...userWithoutPassword } = user.toObject();
    return { 
      accessToken: this.jwtService.sign(payload),
      user: userWithoutPassword
    };
  }

  /**
   * Busca todos os usuários cadastrados (com paginação)
   * @param page Número da página (default: 1)
   * @param limit Limite de itens por página (default: 10)
   * @returns Lista de usuários e metadados de paginação
   */
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<{
    data: Omit<UserDocument, 'password'>[],
    total: number,
    pages: number,
    currentPage: number
  }> {
    const skip = (page - 1) * limit;
    const filtro: any = {};
  
    // Se foi passado um termo de busca, busca por nome ou e-mail
    if (search) {
      const regex = new RegExp(search, 'i'); // insensível a maiúsculas/minúsculas
      filtro.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } }
      ];
    }
  
    // Se foi passado um filtro de role, aplica
    if (role) {
      filtro.role = role;
    }
  
    const users = await this.userModel.find(filtro)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .exec();
  
    const total = await this.userModel.countDocuments(filtro);
    const pages = Math.ceil(total / limit);
  
    return {
      data: users,
      total,
      pages,
      currentPage: page
    };
  }

  /**
   * Busca um usuário específico por ID (sem a senha)
   * @param id ID do usuário
   * @returns Dados do usuário (sem senha)
   */
  async findUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id)
      .select('-password') // Exclui o campo password
      .exec();
  }

  async updateUser(
    id: string,
    updateData: { name?: string; email?: string; role?: string }
  ): Promise<UserDocument | null> {
    // Verifica se o novo email já está em uso por outro usuário
    if (updateData.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateData.email,
        _id: { $ne: id } // Exclui o próprio usuário da verificação
      });
      
      if (existingUser) {
        throw new ConflictException('Email já está em uso por outro usuário');
      }
    }
  
    // Atualiza o usuário
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Retorna o documento atualizado
    ).select('-password'); // Exclui o campo password
  
    return updatedUser;
  }
  
  /**
   * Remove um usuário do sistema
   * @param id ID do usuário a ser removido
   * @returns Resultado da operação
   */
  async deleteUser(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }

  async googleLogin(name: string, email: string): Promise<{ accessToken: string, user: any }> {
    // Verifica se o usuário já existe
    let user = await this.userModel.findOne({ email });
  
    if (!user) {
      // Gera uma senha aleatória
      const randomPassword = randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
      // Cria novo usuário com role padrão "aluno"
      user = new this.userModel({
        name,
        email,
        password: hashedPassword,
        role: 'aluno'
      });
  
      await user.save();
    }
  
    // Gera token
    const payload = { 
      name: user.name,
      email: user.email, 
      role: user.role,
      sub: user._id 
    };
  
    const { password: _, ...userWithoutPassword } = user.toObject();
    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithoutPassword
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
  
    const token = await this.jwtService.signAsync(
      { sub: user._id.toString() },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' }
    );
  
    const resetLink = `http://localhost:3001/reset-password?token=${token}`;
  
    // Enviar e-mail (você pode usar nodemailer ou outro serviço)
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
               <h2>Olá ${user.name},</h2>
               <p>Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir sua senha:</p>
               <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#007BFF; color:#fff; text-decoration:none; border-radius:5px;">Redefinir Senha</a>
               <p style="margin-top:20px;">Se você não solicitou isso, ignore este e-mail.</p>
             </div>`,
    });
  
    return { message: 'E-mail enviado com instruções para recuperar a senha' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
  
      const user = await this.userService.findById(payload.sub);
      if (!user) throw new NotFoundException('Usuário não encontrado');
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userService.updatePassword(user.id, hashedPassword);
  
      return { message: 'Senha atualizada com sucesso' };
    } catch (err) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  

  
  

  
}
