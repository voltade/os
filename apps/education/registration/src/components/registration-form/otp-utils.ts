import { authClient } from '#src/lib/auth.ts';

export const sendOtp = async (email: string): Promise<void> => {
  await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'email-verification',
  });
  return Promise.resolve();
};

export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  try {
    await authClient.emailOtp.checkVerificationOtp({
      email,
      otp,
      type: 'email-verification',
    });
    return true;
  } catch (e) {
    return false;
  }
};
