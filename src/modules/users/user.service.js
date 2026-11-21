import userModel from "../../DB/models/user.model.js";
import * as dbService from "../../DB/models/service/DB.service.js";
import { findOne } from "../../DB/models/service/DB.service.js";
import { Encrypt, decrypt } from "../../common/security/encrypt.js";
import { compare, compareSync, hashSync } from "bcrypt";
import { Hash } from "../../common/security/hash.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/user.enum.js";
import multer from "multer";
import { randomUUID } from "node:crypto";
import joi from "joi";
import { emailTemplate } from "../../common/utils/email.templete.js";
import {deletKey,getValue,Keys,setValue,ttl,incr,} from "../../DB/models/service/redis.service.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/events.js";
import { isContext } from "node:vm";
import { sendOtp } from "./user.helper.js";
import { ACCESS_TOKEN_SIGHNATURE, AUDINCE_GAMIL, REFRESH_TOKEN_SIGHNATURE } from "../../../config/config.service.js";
import { success_response } from "../../common/utils/success.response.js";

const client = new OAuth2Client();

// ==============signUp======================
export const signUp = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone, role } = req.body;

  // ---------- checks ----------
  const emailExist = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  if (emailExist) {
    throw new Error("email already exists");
  }

  const allFiles = Object.values(req.files || {}).flat();
  const paths = allFiles.map((file) => file.path);
  if (!paths.length) {
    throw new Error("please upload at least one file");
  }

  // ---------- files ----------
  const coverImages = req.files?.attachments?.map((file) => file.path) || [];
  const profileImage = req.files?.attachment?.[0]?.path;

  // ---------- create user ----------
  const user = await dbService.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: await Hash(password),
      age,
      gender,
      phone: Encrypt(phone),
      role,
      profileImage,
      coverImages,
    },
  });

  // ---------- otp ----------
  const otp = await generate_otp();
  const otpHash = hashSync(otp.toString(), 12);

  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({
      to: email,
      subject: "confirm email",
      html: emailTemplate(otp),
    });
    await setValue({
      key: `otp::${email}`,
      value: otpHash,
      ttl: 60 * 5,
    });
    await setValue({
      key: `otp::max::${email}`,
      value: 1,
      ttl: 60 * 30,
    });
  });
 success_response({
res,
statuscode: 201,
data: user
 })
};

// ==============reSendOtb======================
export const reSendOtb = async (req, res, next) => {
  const { email } = req.body;
  await sendOtp({ email, isConfirmed: false, subject: "confirm email" });
 success_response({
res,
statuscode: 201,
 })
};

// ==============confirmEmail======================
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new Error("email and otp are required", { cause: 400 });
  }

  const otpValue = await getValue({ key: `otp::${email}` });
  if (!otpValue) {
    throw new Error("otp expired", { cause: 400 });
  }

  if (!compareSync(otp.toString(), otpValue)) {
    throw new Error("invalid otp", { cause: 400 });
  }

  const user = await userModel.findOneAndUpdate(
    { email, isConfirmed: { $ne: true } },
    { isConfirmed: true },
    { returnDocument: "after" },
  );
  if (!user) {
    throw new Error("user not exist or already confirmed", { cause: 400 });
  }

  await deletKey(await Keys(`otp::${email}`));

  success_response({
res,
statuscode: 200,
data: user
 })
};

// ==============signUpithGmail===============
export const signUpWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    console.log("body:", req.body);
    const decoded = await client.verifyIdToken({
      idToken,
      audience:
        AUDINCE_GAMIL,
    });
    const { family_name, given_name, picture, email_verified, email } =
      decoded.getPayload();
    let user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await userModel.create({
        fName: given_name,
        lName: family_name,
        profileImage: picture,
        email,
        isConfirmed: email_verified,
        provider: "google",
      });
    }
    if (user.provider == providerEnum.system) {
      throw new Error("you are already registered");
    }
    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      ACCESS_TOKEN_SIGHNATURE,
      {
        expiresIn: "7h",
      },
    );
    const refresh_token = jwt.sign(
      { id: user._id, email: user.email },
      REFRESH_TOKEN_SIGHNATURE,
    );
  success_response({
res,
statuscode: 201,
data: { access_token, refresh_token }
})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// ===============signIn======================
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email: email.toLowerCase(),
      provider: providerEnum.system,
    
    },
  });

  if (!user) {
    throw new Error("email not exist");
  }

  if (!(await compare(password, user.password))) {
    throw new Error("password not correct");
  }

  const tokenId = randomUUID();

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "omar123",
    {
      expiresIn: "5m",
      audience: ["http://localhost:4000", "http://localhost:3000"],
      jwtid: tokenId,
    },
  );

  const refresh_token = jwt.sign(
    { id: user._id, email: user.email },
    "omar123",
    {
      expiresIn: "2h",
      audience: ["http://localhost:4000", "http://localhost:3000"],
      jwtid: tokenId,
    },
  );
 success_response({
res,
statuscode: 201,
data:
{ access_token, refresh_token } });
};

// ================refreshToken================
export const refreshToken = async (req, res, next) => {
  console.log("HEADERS:", req.headers);
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("token not exist", { cause: 400 });
  }
  const decoded = jwt.verify(authorization, "omar123");
  if (!decoded?.id) {
    throw new Error("inValed token", { cause: 400 });
  }
  const user = await findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    "omar123",
    {
      expiresIn: "7h",
    },
  );

   success_response({
res,
statuscode: 201,
data: access_token });
};

// ===============getPtofile==================
export const getProfile = async (req, res, next) => {
  success_response({
res,
statuscode: 201,
data: req.user });
};

// ===============shareProfile================
export const shareProfile = async (req, res, next) => {
  const { id } = req.params;
  console.log({ id });

  let user = await dbService.findById({
    model: userModel,
    id,
    options: { password: 0 },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  user.phone = decrypt(user.phone);
 success_response({
res,
statuscode: 201,
data: user
 })
};

// ==============updateProfile======================
export const updateProfile = async (req, res, next) => {
  console.log(req.files);
  const { fName, lName, age, gender, phone } = req.body;

  let updateQuery = {};

  if (fName !== undefined) {
    updateQuery.fName = fName;
  }
  if (lName !== undefined) {
    updateQuery.lName = lName;
  }
  if (age !== undefined) {
    updateQuery.age = age;
  }
  if (gender !== undefined) {
    updateQuery.fName = gender;
  }
  if (phone !== undefined) {
    updateQuery.phone = Encrypt(phone);
  }

  let user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: updateQuery,
  });

  success_response({
res,
statuscode: 201,
data: user
 })
};

// ==============updatePassword======================
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;

  const match = await compare(oldPassword, user.password);
  if (!match) {
    throw new Error("old password is wrong", { cause: 400 });
  }

  user.password = await Hash(newPassword);
  req.user.changeCredintialAt = new Date();
  await user.save();

  success_response({
res,
statuscode: 200,
data: user
 })
};

// ==============logout======================
export const logout = async (req, res, next) => {
  const { flag } = req.query;

  if (flag == "all") {
    req.user.changeCredintialAt = new Date();
    await req.user.save();

    await deletKey(await Keys(`revoke_token::${req.user._id}`));
  } else {
    await setValue({
      key: `revoke_token::${req.user._id}::${req.decoded.jti}`,
      value: `${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });

    // await dbService.create({
    //   model: revokeTokenModel,
    //   data: {
    //     userId: req.user._id,
    //     expireAt: new Date(req.decoded.exp * 1000),
    //     tokenId: req.decoded.jti,
    //   },
    // });
  }

 success_response({
res,
statuscode: 200,
data: user
 })
};

// ==============forgetPassword======================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
    await sendOtp({ email, isConfirmed: true, subject: "forget password" });

 success_response({
res,
statuscode: 200,
data: user
 })
};

// ==============resetPassword======================
export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const otp = await getValue({ key: `otp::${email}` });
  if (!otp) throw new Error(`token expired`);

  if (!compareSync(code.toString(), otp)) throw new Error(`invalid code`);

  const user = await userModel.findOneAndUpdate(
    { email, isConfirmed: true },
    { password: await Hash(password),
      changeCredintialAt: new Date()
     },
 
  );
  if (!user) throw new Error(`user not exist or not confirmed`, { cause: 400 });

  await deletKey(await Keys(`otp::${email}`));

   success_response({
res,
statuscode: 200,
data: user
 })
};