import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe())
  const port = process.env.PORT || 3100
  await app.listen(port);
  console.log(`MicroShop backend  is running on port ${port}...`)
}
bootstrap();
