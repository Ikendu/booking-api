const mongoose = require(`mongoose`)
const { model, Schema } = mongoose

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, require: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const User = model(`User`, UserSchema)

module.exports = User
