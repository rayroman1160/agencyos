import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_SECURE: z.string().transform((val) => val === "true"),
  // Auth secrets will be added later
});

export const env = envSchema.parse(process.env);
