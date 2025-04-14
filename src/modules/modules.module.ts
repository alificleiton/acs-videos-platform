import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Module as CourseModule, ModuleSchema } from './schemas/module.schema';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { AuthModule } from '../auth/auth.module'; // IMPORTANTE

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CourseModule.name, schema: ModuleSchema }]),
    AuthModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}

