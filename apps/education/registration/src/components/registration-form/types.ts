export type Step = 1 | 2 | 3;

export interface OtpStates {
  parentOtpSent: boolean;
  parentOtpVerified: boolean;
}
