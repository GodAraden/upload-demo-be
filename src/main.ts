import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { access, mkdir } from 'fs/promises';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    await access('assets');
  } catch (error) {
    await mkdir('assets');
  }

  await app.listen(3000);
}
bootstrap();
