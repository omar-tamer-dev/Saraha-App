import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";
import * as dbService from "../../DB/models/service/DB.service.js";

// ==============createMessage======================
export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;

  if (!content && !req.files?.length) {
    throw new Error("content or attachment is required", { cause: 400 });
  }

  const userExist = await dbService.findById({
    model: userModel,
    id: userId,
  });
  if (!userExist) throw new Error("user not exists", { cause: 404 });

  let urls = [];
  if (req.files?.length) {
    for (const file of req.files) {
      urls.push(file.path);
    }
  }

  const message = await dbService.create({
    model: messageModel,
    data: {
      content,
      attachments: urls,
      userId,
    },
  });

  return res.status(201).json({ message: "Done", data: message });
};

// ==============getMessage======================
export const getMessage = async (req, res, next) => {

  const message = await dbService.find({
    model: messageModel,
    data: {
      userId: req.user._id,

    },
  });
return res.status(200).json({ message: "Done", data: message });
};

// ==============getMessageById======================
export const getMessageById = async (req, res, next) => {

  const message = await dbService.findOne({
    model: messageModel,
    data: {
      _id: req.params.id,
      userId: req.user._id,
    },
  });
return res.status(200).json({ message: "Done", data: message });
};