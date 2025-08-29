import { z } from 'zod';

// Email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Phone number validation schema
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine((phone) => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it has reasonable length (8-15 digits)
    if (digitsOnly.length < 8) return false;
    if (digitsOnly.length > 15) return false;

    // Check for valid phone format patterns
    const phonePatterns = [
      /^\+?\d{1,4}[\s-]?\d{8,12}$/, // International format
      /^(\+65[\s-]?)?[689]\d{7}$/, // Singapore format
      /^\d{8,15}$/, // Simple digit format
      /^\+\d{10,15}$/, // International with plus
    ];

    return phonePatterns.some((pattern) => pattern.test(phone));
  }, 'Please enter a valid phone number');

// Name validation schema
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters long');

// OTP validation schema
const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

// Optional email schema (can be empty)
const optionalEmailSchema = z
  .string()
  .optional()
  .refine((email) => {
    if (!email || email.trim() === '') return true; // Allow empty
    return z.string().email().safeParse(email).success;
  }, 'Please enter a valid email address');

// Main form schema
export const registrationSchema = z.object({
  // Parent fields
  parentEmail: emailSchema,
  parentOtp: z.string().optional(), // Will be required conditionally
  parentName: nameSchema,
  parentPhone: phoneSchema,

  // Student fields
  studentName: nameSchema,
  studentEmail: z.string().optional(), // Optional field
  studentOtp: z.string().optional(), // Will be required conditionally
  // Classes selection (ids)
  selectedClassIds: z.array(z.number()),
});

// Schema for step 1 validation
export const step1Schema = registrationSchema
  .pick({
    parentEmail: true,
    parentName: true,
    parentPhone: true,
  })
  .extend({
    parentOtp: z.string().optional(), // Made conditional based on OTP sent state
  });

// Schema for step 2 validation
export const step2Schema = registrationSchema
  .pick({
    studentName: true,
  })
  .extend({
    studentEmail: optionalEmailSchema,
    studentOtp: z.string().optional(), // Made conditional based on email presence
  });

// Dynamic validation functions for conditional fields
export const validateParentOtp = (otpSent: boolean, otpRequired: boolean) => {
  if (otpSent && otpRequired) {
    return otpSchema;
  }
  return z.string().optional();
};

export const validateStudentOtp = (
  emailProvided: boolean,
  otpSent: boolean,
) => {
  if (emailProvided && otpSent) {
    return otpSchema;
  }
  return z.string().optional();
};

export const validateStudentEmail = (email: string) => {
  if (email && email.trim().length > 0) {
    return emailSchema.safeParse(email).success;
  }
  return true; // Empty email is allowed
};

export type RegistrationFormData = z.infer<typeof registrationSchema>;
