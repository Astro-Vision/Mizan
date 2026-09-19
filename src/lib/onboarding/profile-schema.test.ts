import { describe, expect, it } from 'vitest';

import { onboardingProfileSchema } from './profile-schema';

describe('onboardingProfileSchema', () => {
  it('accepts the approved onboarding profile', () => {
    const result = onboardingProfileSchema.parse({
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      userType: 'DONOR',
      whatsappNumber: '+6281234567890',
      whatsappNotificationConsent: true,
      referralSource: 'FRIEND',
      referralSourceOther: null,
      dataConsent: true,
    });

    expect(result.username).toBe('mizan-user');
  });

  it('rejects incomplete consent and malformed optional WhatsApp number', () => {
    const result = onboardingProfileSchema.safeParse({
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      userType: 'DONOR',
      whatsappNumber: '08123',
      whatsappNotificationConsent: false,
      referralSource: 'OTHER',
      referralSourceOther: '',
      dataConsent: false,
    });

    expect(result.success).toBe(false);
  });
});
