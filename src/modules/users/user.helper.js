import { hashSync } from "bcrypt";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { emailTemplate } from "../../common/utils/email.templete.js";
import { eventEmitter } from "../../common/utils/events.js";
import { deletKey, getValue, incr, Keys, setValue, ttl } from "../../DB/models/service/redis.service.js";
import userModel from "../../DB/models/user.model.js";
import { findOne } from "../../DB/models/service/DB.service.js";

export const sendOtp = async ({email, isConfirmed, subject = "confirm email"} = {}) => {
      const isBlocked_tll = await ttl({ key: `otp::block::${email}` });
  if (isBlocked_tll > 0) {
    throw new Error(
      `you have exceeded resend the-maximam number of tries please wait ${isBlocked_tll} seconds`,
    );
  }

  const max_otp = await getValue({ key: `otp::max::${email}` });
  if (max_otp >= 5) {
    await setValue({
      key: `otp::block::${email}`,
      value: 1,
      ttl: 60 * 30,
    });

    await deletKey(await Keys(`otp::max::${email}`));

    throw new Error(`you have exceeded resend the-maximam number of tries`);
  }

  const otpTTl = await ttl({ key: `otp::${email}` });
  if (otpTTl > 0)
    throw new Error(`otp already sent, please wait ${otpTTl} seconds`);
console.log({ email, isConfirmed })
const user = await findOne({
  model: userModel,
  filter: {
    email,
    isConfirmed: isConfirmed ? true : { $ne: true },
  },
});
  if (!user) {
    throw new Error("user not exist or already confirmed", { cause: 400 });
  }

  const otp = await generate_otp();
  const otpHash = hashSync(otp.toString(), 12);

  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 5,
  });

  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({
      to: email,
      subject,
      html:emailTemplate(otp),
    });
  });

  await incr(`otp::max::${email}`);
}