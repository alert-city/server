import { z } from 'zod';

export const createEventSchema = z.object({
    eventType: z.string().min(1, "Event type is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().optional(),
    subject: z.string().min(1, "Subject is required").max(255, "Words limitation is reached"),
    matter: z.string().min(1, "Matter is required").max(1000, "Words limitation is reached"),
    ERTime: z.string().optional(),
    ERDate: z.string().optional(),
    submitter: z.string().min(1, "Submitter is required"),
    orgName: z.string().optional(),

});