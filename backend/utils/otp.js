const otpStore = new Map();

export const generateOTP = (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  return otp;
};

export const verifyOTP = (email, inputOtp) => {
  const record = otpStore.get(email);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  const isValid = record.otp === inputOtp;
  if (isValid) otpStore.delete(email);
  return isValid;
};