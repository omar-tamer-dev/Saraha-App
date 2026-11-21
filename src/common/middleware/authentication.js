import jwt from "jsonwebtoken";
import { findOne } from "../../DB/models/service/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { logout } from "../../modules/users/user.service.js";
import { ttl } from "../../DB/models/service/redis.service.js";
import { ACCESS_TOKEN_SIGHNATURE } from "../../../config/config.service.js";

export const authentication = async (req, res, next) => {
  console.log("headers:", req.headers);

  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist", { cause: 400 });
  }
  const decoded = jwt.verify(authorization, ACCESS_TOKEN_SIGHNATURE);

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

  if (user?.changeCredintialAt?.getTime() > decoded.iat * 1000) {
    throw new Error("token is expird you must be login again", { cause: 401 });
  }

  if (await ttl({ key: `revoke_token::${user._id}::${decoded.jti}` }) > 0) {
    throw new Error("inValid revoked token", { cause: 401 });
  }

  req.user = user;
  req.decoded = decoded;
  next();
};