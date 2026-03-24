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
    required: true,
  },

  tokenVersion: {
    type: Number,
    default: 0,
  },

  refreshToken: {
    type: String,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: String,

  emailVerificationExpires: Date,
});

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.refreshToken;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    return ret;
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
