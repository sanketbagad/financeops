import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, User } from './chat.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<Chat>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async createMessage(chat: Chat): Promise<Chat> {
    const createdChat = new this.chatModel(chat);
    return createdChat.save();
  }

  async getAllMessages(): Promise<Chat[]> {
    return this.chatModel.find().populate('user').exec();
  }

  async createUser(user: User): Promise<User> {

    // Check if username already exists
    let existingUser = await this.userModel.findOne({ user }).exec();
    if (existingUser) {
      return existingUser; // Return existing user if found
    }

    // Create new user if username doesn't exist
    const createdUser = new this.userModel(user);
    return createdUser.save(); // Save and return the new user
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getMessageByUser(user: string): Promise<Chat[]> {
    return this.chatModel.find({ user }).exec();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }
}
