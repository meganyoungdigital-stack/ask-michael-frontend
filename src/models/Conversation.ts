import mongoose from "mongoose"

const ConversationSchema = new mongoose.Schema({

  conversationId: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    default: "New Chat"
  },

  starred: {
    type: Boolean,
    default: false
  },

  messages: [
    {
      role: String,
      content: String
    }
  ]

}, { timestamps: true })

export default mongoose.models.Conversation ||
mongoose.model("Conversation", ConversationSchema)