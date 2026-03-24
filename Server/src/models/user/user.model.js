import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
  },

  password: {
    type: String,
    required: true
  },
})

const userModel = mongoose.model("users", userSchema);

export default userModel;