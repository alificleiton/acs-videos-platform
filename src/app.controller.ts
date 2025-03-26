import { Controller, Get } from '@nestjs/common';

@Controller() // Define que esse é um controlador
export class AppController {
  @Get() // Define uma rota GET para "/"
  getHello(): string {
    return '🚀 API está funcionando!';
  }
}