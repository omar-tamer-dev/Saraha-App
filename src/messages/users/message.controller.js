import { Router } from "express";
import * as MS from "./message.service.js";
import { validation } from "../../common/middleware/validation.js";
import * as MV from "./message.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { Multer_Enum } from "../../common/enum/multer.enum.js";
import { authorization } from "../../common/middleware/authorization.js";
import { authentication } from "../../common/middleware/authentication.js";

const messageRouter = Router({strict: true, caseSensitive: true, merdeParams: true});

messageRouter.post(
  "/createMessage",
  multerLocal({ customPath: "messages", customTypes: Multer_Enum.Images }).array("attachments", 2),
  validation(MV.createMessageSchema),
  MS.createMessage
);

messageRouter.get("/getMessage", authentication, MS.getMessage);
messageRouter.get("/getMessage/:id", authentication, MS.getMessageById);

export default messageRouter
