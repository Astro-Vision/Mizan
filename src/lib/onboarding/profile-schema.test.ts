import { describe, expect, it } from 'vitest';

import { onboardingProfileSchema } from './profile-schema';

describe('onboardingProfileSchema', () => {
  it('accepts the approved onboarding profile for BENEFACTOR', () => {
    const result = onboardingProfileSchema.parse({
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      userType: 'BENEFACTOR',
      whatsappNumber: '+6281234567890',
      whatsappNotificationConsent: true,
      referralSource: 'FRIEND',
      referralSourceOther: null,
      dataConsent: true,
    });

    expect(result.username).toBe('mizan-user');
    expect(result.userType).toBe('BENEFACTOR');
  });

  it('accepts the approved onboarding profile for BENEFICIARY', () => {
    const result = onboardingProfileSchema.parse({
      username: 'mizan-beneficiary',
      domicile: 'Jakarta',
      userType: 'BENEFICIARY',
      whatsappNumber: '+6281234567890',
      whatsappNotificationConsent: true,
      referralSource: 'COMMUNITY',
      referralSourceOther: null,
      dataConsent: true,
    });

    expect(result.username).toBe('mizan-beneficiary');
    expect(result.userType).toBe('BENEFICIARY');
  });

  it('rejects incomplete consent and malformed optional WhatsApp number', () => {
    const result = onboardingProfileSchema.safeParse({
      username: 'mizan-user',
      domicile: 'Yogyakarta',
      userType: 'BENEFACTOR',
      whatsappNumber: '08123',
      whatsappNotificationConsent: false,
      referralSource: 'OTHER',
      referralSourceOther: '',
      dataConsent: false,
    });

    expect(result.success).toBe(false);
  });
});
