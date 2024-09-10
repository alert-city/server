import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
    'Password must contain at least one special character (e.g. +-!@#$%^&*)',
  );

export const createUserSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username cannot be empty')
      .max(255)
      .email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    displayName: z.string().min(1, 'Display name cannot be empty').max(255),
    accountType: z.enum(['Personal', 'Organization']),
    role: z.array(z.string().min(1, 'Role cannot be empty').max(255)),
    firstName: z
      .string()
      .min(1, 'First name cannot be empty')
      .max(100)
      .optional(),
    lastName: z
      .string()
      .min(1, 'Last name cannot be empty')
      .max(100)
      .optional(),
    orgName: z
      .string()
      .min(1, 'Organization name cannot be empty')
      .max(255)
      .optional(),
    captchaToken: z.string().min(1, 'Captcha token cannot be empty'),
    phoneNumber: z
      .string()
      .min(1, 'Phone number cannot be empty')
      .max(255)
      .regex(
        /^(?:\+61|0)([2378]\d{8}|4\d{8})$/,
        'Phone number must start with +61 or 0, and contain either 9 digits for mobile (starting with 4) or 8 digits for landline (starting with 2, 3, 7, or 8), without spaces',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(1, 'Email cannot be empty')
    .max(255)
    .email('Invalid email address')
    .optional(),
  displayName: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(255)
    .optional(),
  accountType: z.enum(['personal', 'organization']).optional(),
  role: z
    .array(z.string().min(1, 'Role cannot be empty').max(255))
    .min(1, 'Role cannot be empty')
    .optional(),
  organization: z
    .array(z.string().min(1, 'Organization cannot be empty').max(255))
    .optional(),
  staffs: z
    .array(z.string().min(1, 'Staff cannot be empty'))
    .optional()
    .optional(),
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(100)
    .optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').max(100).optional(),
  orgName: z
    .string()
    .min(1, 'Organization name cannot be empty')
    .max(255)
    .optional(),
  avatarUrl: z.string().min(1, 'Avatar URL cannot be empty').optional(),
  phoneNumber: z
    .string()
    .min(1, 'Phone number cannot be empty')
    .max(255)
    .regex(
      /^(?:\+61|0)([2378]\d{8}|4\d{8})$/,
      'Phone number must start with +61 or 0, and contain either 9 digits for mobile (starting with 4) or 8 digits for landline (starting with 2, 3, 7, or 8), without spaces',
    )
    .optional(),
  is2FAEnabled: z.boolean().optional(),
  twoFASecret: z.string().nullable().optional(),
  isFirstLogin: z.boolean().optional(),
  verificationCode: z
    .string()
    .min(6, 'Verification code must be at least 6 characters')
    .optional(),
});
