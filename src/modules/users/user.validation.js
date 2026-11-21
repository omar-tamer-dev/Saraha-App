 import joi from "joi";
 import { generalRules } from "../../common/utils/generalRules.js"
import { authorization } from "../../common/middleware/authorization.js";


   export  const signUpSchema = {

    body: joi.object({
       fName: joi.string().alphanum().min(2).max(10).messages({
        "any.required": "First name is required",
       }),
       lName: joi.string().messages({
        "any.required": "Last name is required",
       }),
       email: generalRules.email.messages({
        "any.required": "Email is required",
        "string.email": "Please provide a valid email address",
       }),
       password:  generalRules.password.messages({
        "any.required": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 100 characters",
       }),
       cPassword: joi.string().valid(joi.ref("password")).messages({
        "any.required": "Confirm password is required",
        "any.only": "Passwords do not match",
       }),
       age: joi.number().min(0).messages({
        "any.required": "Age is required",
       }),
       gender: joi.string().valid("male", "female").messages({
        "any.required": "Gender is required",
        "any.only": "Please select a valid gender",
       }),
       phone: joi.string().required().messages({
        "any.required": "Phone number is required",
       }),
       role: joi.string().valid("user", "admin").messages({
        "any.required": "Role is required",
       })
     }).options({ presence: "required" }).with("password", "cPassword") .required().messages({
    "any.required":"body is empty"
   }),

files: joi.object({
  attachment: joi.array().items(generalRules.file.required()).required(),
   attachments: joi.array().items(generalRules.file.required()).required()
}).required()
} 
  export  const signInSchema = {
    body: joi.object({
       email: generalRules.email,
       password: generalRules.password
     }).required()
   }
  export  const refreshTokenSchema = {
    headers:generalRules.token.required()
  }
  export  const shareProfileSchema = {
    params: joi.object({
       id: generalRules.id.required(),
     }).required()
  }
   export  const updateProfileSchema = {
    body: joi.object({
       fName: joi.string().alphanum().min(2).max(10),
       lName: joi.string(),
       age: joi.number(),
       gender: joi.string().valid("male", "female"),
       phone: joi.number()
   }).required()
   }
   export const updatePasswordSchema = {
    body: joi.object({
       oldPassword: generalRules.password.required(),
       newPassword: generalRules.password.required(),
        cPassword: joi.string().valid(joi.ref("newPassword"))
     }).required()
   }  
  export  const confirmEmailSchema = {
    body: joi.object({
       email: joi.string().required(),
       otp: joi.string().pattern(/^[0-9]{6}$/).required()
     })
   }
