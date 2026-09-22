import { z } from 'zod';

const referralSources = [
  'SOCIAL_MEDIA',
  'FRIEND',
  'COMMUNITY',
  'SEARCH',
  'EVENT',
  'OTHER',
] as const;

export const onboardingProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_-]+$/, 'Username hanya boleh berisi huruf, angka, _ dan -'),
    domicile: z.string().trim().min(2).max(120),
    userType: z.enum(['BENEFACTOR', 'BENEFICIARY', 'DONOR']),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{7,14}$/, 'Gunakan format internasional, contoh +628123456789')
      .nullable()
      .optional()
      .transform((value) => value || null),
    whatsappNotificationConsent: z.boolean(),
    referralSource: z.enum(referralSources),
    referralSourceOther: z.string().trim().max(120).nullable().optional(),
    dataConsent: z.literal(true),
  })
  .superRefine((value, context) => {
    if (value.whatsappNotificationConsent && !value.whatsappNumber) {
      context.addIssue({
        code: 'custom',
        path: ['whatsappNotificationConsent'],
        message: 'Nomor WhatsApp diperlukan untuk menerima notifikasi',
      });
    }

    if (value.referralSource === 'OTHER' && !value.referralSourceOther) {
      context.addIssue({
        code: 'custom',
        path: ['referralSourceOther'],
        message: 'Jelaskan sumber informasi lainnya',
      });
    }
  });

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
