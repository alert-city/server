import { z } from 'zod';
import { passwordSchema } from '@/validation/schemas/user/user.schema';

export const getCodeSchema = z.object({
  username: z.string().min(1, 'Username is required').email('Invalid email address'),
  emailInfoType: z.number().int().min(1, 'Email info type must be at least 1'),
});

export const resetPasswordSchema = z.object({
  verificationCode: z.string().min(6, 'Verification code must be at least 6 characters'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});