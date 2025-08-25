import { create } from 'zustand';

import { authClient } from '#src/lib/auth.ts';

type Step = 1 | 2 | 3;

interface RegistrationState {
  // Navigation
  step: Step;
  next: () => void;
  back: () => void;
  reset: () => void;

  // Gates (toggle this if you want to require verification instead of just sent)
  requireParentVerification: boolean;

  // Parent OTP state
  parentOtpSent: boolean;
  parentOtpVerified: boolean;
  sendParentOtp: (email: string) => Promise<void>;
  verifyParentOtp: (email: string, otp: string) => Promise<void>;

  // Student OTP state
  studentOtpRequired: boolean; // derived by UI from whether email is present; we keep a flag to simplify
  setStudentOtpRequired: (v: boolean) => void;
  studentOtpSent: boolean;
  studentOtpVerified: boolean;
  sendStudentOtp: (email: string) => Promise<void>;
  verifyStudentOtp: (email: string, otp: string) => Promise<void>;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // nav
  step: 1,
  next: () =>
    set((s) => ({
      step: s.step < 3 ? ((s.step + 1) as Step) : 3,
    })),
  back: () =>
    set((s) => ({
      step: s.step > 1 ? ((s.step - 1) as Step) : 1,
    })),
  reset: () =>
    set({
      step: 1,
      parentOtpSent: false,
      parentOtpVerified: false,
      studentOtpRequired: false,
      studentOtpSent: false,
      studentOtpVerified: false,
    }),

  // gate
  requireParentVerification: false, // set true to require verification instead of just “sent”

  // parent OTP
  parentOtpSent: false,
  parentOtpVerified: false,
  sendParentOtp: async (email: string) => {
    // TODO: wire your real implementation
    await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
    set({ parentOtpSent: true });
  },
  verifyParentOtp: async (email: string, otp: string) => {
    // TODO: wire your real implementation
    await authClient.emailOtp.checkVerificationOtp({
      email,
      otp,
      type: 'email-verification',
    });
    set({ parentOtpVerified: true });
  },

  // student OTP
  studentOtpRequired: false,
  setStudentOtpRequired: (v: boolean) =>
    set({
      studentOtpRequired: v,
      // if no longer required, reset student otp states
      ...(v ? {} : { studentOtpSent: false, studentOtpVerified: false }),
    }),
  studentOtpSent: false,
  studentOtpVerified: false,
  sendStudentOtp: async (_email: string) => {
    // TODO: wire your real implementation
    set({ studentOtpSent: true });
  },
  verifyStudentOtp: async (_email: string, _otp: string) => {
    // TODO: wire your real implementation
    set({ studentOtpVerified: true });
  },
}));

// Convenient selectors (helps avoid re-renders)
export const useStep = () => useRegistrationStore((s) => s.step);
export const useNav = () =>
  useRegistrationStore((s) => ({ next: s.next, back: s.back, reset: s.reset }));
export const useParentGate = () =>
  useRegistrationStore((s) => ({
    requireParentVerification: s.requireParentVerification,
    parentOtpSent: s.parentOtpSent,
    parentOtpVerified: s.parentOtpVerified,
    sendParentOtp: s.sendParentOtp,
    verifyParentOtp: s.verifyParentOtp,
  }));
export const useStudentGate = () =>
  useRegistrationStore((s) => ({
    studentOtpRequired: s.studentOtpRequired,
    setStudentOtpRequired: s.setStudentOtpRequired,
    studentOtpSent: s.studentOtpSent,
    studentOtpVerified: s.studentOtpVerified,
    sendStudentOtp: s.sendStudentOtp,
    verifyStudentOtp: s.verifyStudentOtp,
  }));
