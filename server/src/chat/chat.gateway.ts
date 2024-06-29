import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Chat } from './chat.interface';


@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: Chat, @ConnectedSocket() client: Socket): Promise<void> {
    console.log(message);
    const createdMessage = await this.chatService.createMessage(message);
    this.server.emit('message', createdMessage);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() user: string, @ConnectedSocket() client: Socket): void {
    client.join(user);
    client.broadcast.emit('userJoined', user);
  }
}
