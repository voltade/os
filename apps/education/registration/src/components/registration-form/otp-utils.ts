import { authClient } from '#src/lib/auth.ts';

export const sendOtp = async (email: string): Promise<void> => {
  await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'sign-in',
  });
  return Promise.resolve();
};

export const sendParentOtp = async (email: string): Promise<void> => {
  await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'sign-in',
  });
  return Promise.resolve();
};

export const verifyParentOtp = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  try {
    await authClient.signIn.emailOtp({ email, otp });
    return true;
  } catch (e) {
    return false;
  }
};

export const sendChildOtp = async (email: string): Promise<void> => {
  await authClient.emailOtp.sendVerificationOtp({
    email,
    type: 'sign-in',
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
