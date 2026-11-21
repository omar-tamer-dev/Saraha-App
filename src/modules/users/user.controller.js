import { Router } from "express";
import * as US from "./user.service.js"
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js"
import { RoleEnum } from "../../common/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { signUpSchema, signInSchema, refreshTokenSchema, shareProfileSchema, updateProfileSchema, updatePasswordSchema, confirmEmailSchema } from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import messageRouter from "../../messages/users/message.controller.js";

const userRouter = Router({strict: true, caseSensitive: true});

userRouter.use("/:userId/message", messageRouter);

userRouter.post(
  "/signUp",
  multerLocal({ customPath: "admins", customTypes: ["image/jpeg"] }).fields([
    { name: "attachments", maxCount: 2 },
    { name: "attachment", maxCount: 1 },
  ]),
  validation(signUpSchema),
  US.signUp
);
userRouter.post("/signup/gmail", validation(signUpSchema), US.signUpWithGmail)
userRouter.post("/signIn", validation(signInSchema), US.signIn)
userRouter.post("/refresh_token", validation(refreshTokenSchema), US.refreshToken)
userRouter.get("/profile", authentication, authorization([RoleEnum.user,RoleEnum.admin]), US.getProfile)
userRouter.get("/share-profile/:id", validation(shareProfileSchema), US.shareProfile)
userRouter.patch("/reSend-otp", US.reSendOtb)
userRouter.patch("/forget-password", US.forgetPassword)
userRouter.patch("/reset-password", US.resetPassword)
userRouter.patch("/confirmEmail",validation(confirmEmailSchema), US.confirmEmail)
userRouter.patch("/update-profile", authentication, validation(updateProfileSchema), US.updateProfile)
userRouter.patch("/update-Password", authentication, validation(updatePasswordSchema), US.updatePassword)
userRouter.patch("/logout", authentication, US.logout)

export default userRouter
