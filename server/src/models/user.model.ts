import { Schema, model } from 'mongoose'

const COLLECTION_NAME = 'users'
const DOCUMENT_NAME = 'User'

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 150,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    verify: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
)

export default model(DOCUMENT_NAME, UserSchema)
