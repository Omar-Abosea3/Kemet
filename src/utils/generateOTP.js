import otpGenerator from "otp-generator";

const generateOTPFunction = () => {
    const OTPCode = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    return OTPCode;
}

export const checkOtpValidation = (user) => {
    const now = new Date();
    const timeDifference = now.getTime() - user.updatedAt.getTime();
    const validityDuration = 5 * 60 * 1000;
    if (timeDifference > validityDuration) {
        return false; // OTP has expired
    }
    return true;
}

export default generateOTPFunction ;