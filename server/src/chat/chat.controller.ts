import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from './chat.interface';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('user')
  async createUser(@Body() user: User): Promise<User> {
    return this.chatService.createUser(user);
  }

  @Post('chat')
  async createMessage(@Body() chat): Promise<any> {
    return this.chatService.createMessage(chat);
  }


  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.chatService.getAllUsers();
  }

  @Get('messages')
  async getAllMessages(): Promise<any> {
    return this.chatService.getAllMessages();
  }

  @Get('message/:id')
    async getMessageByUser(@Body() user: string): Promise<any> {
      return this.chatService.getMessageByUser(user);
    }

  @Get('user/:id')
  async getUserById(id: string): Promise<User> {
    return this.chatService.getUserById(id);
  }

}
