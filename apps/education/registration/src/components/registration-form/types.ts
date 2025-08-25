export type Step = 1 | 2 | 3;

export interface OtpStates {
  parentOtpSent: boolean;
  parentOtpVerified: boolean;
  studentOtpSent: boolean;
  studentOtpVerified: boolean;
  studentOtpRequired: boolean;
}
