import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(1, "Email cannot be empty").max(255).email("Invalid email address"),
  password: z.string().min(1, "Password cannot be empty").max(255),
  accountType: z.string().min(1, "Account type cannot be empty").max(255),
  role: z.array(z.string().min(1, "Role cannot be empty").max(255)),
  organization: z.array(z.string().min(1, "Organization cannot be empty").max(255)).optional(),
  name: z.object({
    firstName: z.string().min(1, "First name cannot be empty").max(255),
    lastName: z.string().min(1, "Last name cannot be empty").max(255),
  }),
  mobilePhone: z.string()
    .min(1, "Mobile phone cannot be empty")
    .max(255)
    .regex(/^\+61\d{9}$/, "Mobile phone number must start with +61 and contain 9 digits after the country code"),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, "Email cannot be empty").max(255).email("Invalid email address").optional(),
  password: z.string().min(1, "Password cannot be empty").max(255).optional(),
  accountType: z.string().min(1, "Account type cannot be empty").max(255).optional(),
  role: z.array(z.string().min(1, "Role cannot be empty").max(255)).min(1, "Role cannot be empty").optional(),
  organization: z.array(z.string().min(1, "Organization cannot be empty").max(255)).optional(),
  name: z.object({
    firstName: z.string().min(1, "First name cannot be empty").max(255).optional(),
    lastName: z.string().min(1, "Last name cannot be empty").max(255).optional(),
  }).optional(),
  mobilePhone: z.string()
    .min(1, "Mobile phone cannot be empty")
    .max(255)
    .regex(/^\+61\d{9}$/, "Mobile phone number must start with +61 and contain 9 digits after the country code")
    .optional(),
});

