import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user.module'; // <-- Adicione
import { UploadUserAvatarService } from './upload-user-avatar.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'minhaChaveSecreta', // Melhor armazenar isso em variáveis de ambiente
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UploadUserAvatarService],
  exports: [JwtModule, AuthService, UploadUserAvatarService], // 📢 Exportando o JwtModule e AuthService
})
export class AuthModule {}
