import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [MongooseModule.forRoot('//your mongo url'), ChatModule],
})
export class AppModule {}
