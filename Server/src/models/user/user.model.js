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
});

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;