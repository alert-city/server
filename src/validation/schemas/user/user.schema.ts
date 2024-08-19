import { z } from 'zod';

export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const createUserSchema = z.object({
  username: z.string().min(1, "Email cannot be empty").max(255).email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  displayName: z.string().min(1, "Display name cannot be empty").max(255),
  accountType: z.enum(["personal", "organization"]),
  role: z.array(z.string().min(1, "Role cannot be empty").max(255)),
  organization: z.array(z.string().min(1, "Organization cannot be empty").max(255)).optional(),
  staffs: z.array(z.string().min(1, "Staff cannot be empty").max(255)).optional().optional(),
  name: z.object({
    firstName: z.string().min(1, "First name cannot be empty").max(255).optional(),
    lastName: z.string().min(1, "Last name cannot be empty").max(255).optional(),
  }).optional(),
  orgName: z.string().min(1, "Organization name cannot be empty").max(255).optional(),
  mobilePhone: z.string()
    .min(1, "Mobile phone cannot be empty")
    .max(255)
    .regex(/^\+61\d{9}$/, "Mobile phone number must start with +61 and contain 9 digits after the country code"),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});


export const updateUserSchema = z.object({
  username: z.string().min(1, "Email cannot be empty").max(255).email("Invalid email address").optional(),
  displayName: z.string().min(1, "Display name cannot be empty").max(255).optional(),
  accountType: z.enum(["personal", "organization"]).optional(),
  role: z.array(z.string().min(1, "Role cannot be empty").max(255)).min(1, "Role cannot be empty").optional(),
  organization: z.array(z.string().min(1, "Organization cannot be empty").max(255)).optional(),
  staffs: z.array(z.string().min(1, "Staff cannot be empty").max(255)).optional().optional(),
  name: z.object({
    firstName: z.string().min(1, "First name cannot be empty").max(255).optional(),
    lastName: z.string().min(1, "Last name cannot be empty").max(255).optional(),
  }).optional(),
  orgName: z.string().min(1, "Organization name cannot be empty").max(255).optional(),
  mobilePhone: z.string()
    .min(1, "Mobile phone cannot be empty")
    .max(255)
    .regex(/^\+61\d{9}$/, "Mobile phone number must start with +61 and contain 9 digits after the country code")
    .optional(),
  verificationCode: z.string().min(1, "Verification code cannot be empty").max(255).optional(),
});

