 import joi from "joi";
 import { generalRules } from "../../common/utils/generalRules.js"
import { authorization } from "../../common/middleware/authorization.js";


   export  const createMessageSchema = {

    body: joi.object({
       content: joi.string(),
       userId: generalRules.id.required()
   }).required(),


  files: joi.array().items(generalRules.file),
   }
