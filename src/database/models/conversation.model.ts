import mongoose, { Schema, models, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  connection?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  connection: {
    type: Schema.Types.ObjectId,
    ref: "Connection"
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message"
  }
}, { timestamps: true });

// Ensure unique conversation per participant set
ConversationSchema.index({ participants: 1 });

const Conversation = models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
