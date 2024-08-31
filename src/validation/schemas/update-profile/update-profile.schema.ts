import { z } from 'zod';


export const updateUsernameSchema = z.object({
  newUsername: z.string().min(1, "Email cannot be empty").max(255).email("Invalid email address"),
  emailInfoType: z.union([z.literal(1), z.literal(2)]),
})