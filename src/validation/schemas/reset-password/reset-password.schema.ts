import { z } from 'zod';
import { passwordSchema } from '@/validation/schemas/user/user.schema';

export const getCodeSchema = z.object({
  username: z.string().min(1, 'Username is required').email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  verificationCode: z.string().min(6, 'Verification code must be at least 6 characters'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});