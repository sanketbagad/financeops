import * as mongoose from 'mongoose';

export const ChatSchema = new mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  message: String,
  timestamp: String,
});

export const userSchema = new mongoose.Schema({
    name: String
})