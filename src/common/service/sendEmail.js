import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";

const sendEmail = async ({to, subject, attachments, html }) => {

    const { EMAIL, PASS } = process.env;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth:{
            user: EMAIL,
            pass: PASS
        }
    })

  const info = await transporter.sendMail({
    from: `"sarahaApp" <${EMAIL}>`, 
    to,
    subject,
    html,
    attachments: attachments || []
  });
return info.accepted.length > 0 ? true : false
}

export const generate_otp = async () => {
    return randomInt(100000, 1000000)
}

export default sendEmail