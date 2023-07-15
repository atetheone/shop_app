import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuilderModule } from './modules/builder/builder.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ 
    HttpModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI_DEV,
    ),
    BuilderModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
