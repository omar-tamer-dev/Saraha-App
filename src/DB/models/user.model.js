import mongoose from "mongoose";
import { GenderEnum } from "../../common/user.enum.js";
import { providerEnum } from "../../common/user.enum.js";
import { RoleEnum } from "../../common/user.enum.js";
import * as Joi from "joi"; 
const userSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    lName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == providerEnum.system;
      },
      trim: true,
    },
    age: {
      type: Number,
      required: function () {
        return this.provider == providerEnum.system;
      },
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },
    phone: {
      type: String,
      required: function () {
        return this.provider == "system" ? true : false;
      },
    },
    profileImage: String,
      coverImages: [String],
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },
    isConfirmed: {
      type: Boolean,
    },
    changeCredintialAt: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;