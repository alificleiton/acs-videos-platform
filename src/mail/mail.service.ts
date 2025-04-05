import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3001/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Olá!</p>
        <p>Você solicitou a redefinição da senha. Clique no link abaixo para redefinir:</p>
        <a href="${resetUrl}">Redefinir senha</a>
        <p>Se você não fez essa solicitação, ignore este e-mail.</p>
      `,
    });
  }
}