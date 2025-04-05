import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { randomBytes } from 'crypto';

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

  /**
   * Busca todos os usuários cadastrados (com paginação)
   * @param page Número da página (default: 1)
   * @param limit Limite de itens por página (default: 10)
   * @returns Lista de usuários e metadados de paginação
   */
  async findAllUsers(page: number = 1, limit: number = 10, search: string, role: string): Promise<{
    data: Omit<UserDocument, 'password'>[],
    total: number,
    pages: number,
    currentPage: number
  }> {
    const skip = (page - 1) * limit;
    
    // Busca os usuários (excluindo a senha) com paginação
    const users = await this.userModel.find()
      .select('-password') // Exclui o campo password
      .skip(skip)
      .limit(limit)
      .exec();

    // Conta o total de usuários para cálculo de páginas
    const total = await this.userModel.countDocuments();
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

  
}
