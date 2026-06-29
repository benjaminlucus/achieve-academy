import mongoose, { Schema, models, Document } from "mongoose";

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  messageType: "text" | "image" | "video" | "voice" | "file" | "call";
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  callDuration?: number;
  isRead: boolean;
  readAt?: Date;
  isEdited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "voice", "file", "call"],
    default: "text"
  },
  mediaUrl: String,
  mediaName: String,
  mediaSize: Number,
  callDuration: Number, // In seconds
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isEdited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for fast message retrieval in a conversation
MessageSchema.index({ conversation: 1, createdAt: -1 });

const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
