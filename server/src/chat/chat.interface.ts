import { Document } from 'mongoose';

export interface Chat extends Document {
  user: string[];
  message: string;
  timestamp: string;
}

export interface User extends Document {
    name: string;
}