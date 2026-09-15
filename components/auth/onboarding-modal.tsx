'use client';

import { FormEvent, useState } from 'react';

import {
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from '@/lib/onboarding/profile-schema';

type OnboardingFormValues = {
  username: string;
  domicile: string;
  userType: OnboardingProfileInput['userType'];
  whatsappNumber: string;
  whatsappNotificationConsent: boolean;
  referralSource: OnboardingProfileInput['referralSource'];
  referralSourceOther: string;
  dataConsent: boolean;
};

type OnboardingModalProps = {
  identityToken: string;
  onCompleted: () => void;
};

const initialValues: OnboardingFormValues = {
  username: '',
  domicile: '',
  userType: 'DONOR',
  whatsappNumber: '',
  whatsappNotificationConsent: false,
  referralSource: 'SOCIAL_MEDIA',
  referralSourceOther: '',
  dataConsent: false,
};

export function OnboardingModal({
  identityToken,
  onCompleted,
}: OnboardingModalProps) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = <Key extends keyof OnboardingFormValues>(
    key: Key,
    value: OnboardingFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = onboardingProfileSchema.safeParse({
      ...values,
      whatsappNumber: values.whatsappNumber || null,
      referralSourceOther: values.referralSourceOther || null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Periksa kembali data Anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'privy-id-token': identityToken,
        },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error('Profil belum dapat disimpan. Coba lagi.');
      }

      onCompleted();
    } catch (submissionError) {
      console.error('Onboarding form failed', submissionError);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Profil belum dapat disimpan. Coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/60 px-4 py-8">
      <div
        className="mx-auto max-w-2xl rounded-xl border border-line-soft bg-canvas p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Langkah pertama
        </p>
        <h1 id="onboarding-title" className="mt-2 text-2xl font-bold text-ink">
          Kenalan dengan Mizan
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-body">
          Lengkapi profil satu kali agar kami dapat menyesuaikan pengalaman dan
          mengirimkan informasi penting yang relevan.
        </p>

        <form className="mt-6 space-y-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Username
              <input
                required
                value={values.username}
                onChange={(event) => updateValue('username', event.target.value)}
                placeholder="contoh: mizan_user"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-ink">
              Kota / domisili
              <input
                required
                value={values.domicile}
                onChange={(event) => updateValue('domicile', event.target.value)}
                placeholder="Contoh: Yogyakarta"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-ink">Tipe pengguna</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['DONOR', 'Donatur'],
                ['BENEFICIARY', 'Penerima manfaat'],
                ['ORGANIZATION', 'Organisasi'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-line-soft px-3 py-3 text-sm text-ink-body"
                >
                  <input
                    type="radio"
                    name="userType"
                    value={value}
                    checked={values.userType === value}
                    onChange={() =>
                      updateValue(
                        'userType',
                        value as OnboardingFormValues['userType'],
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Nomor WhatsApp <span className="font-normal text-ink-muted">(opsional)</span>
              <input
                type="tel"
                value={values.whatsappNumber}
                onChange={(event) => updateValue('whatsappNumber', event.target.value)}
                placeholder="+6281234567890"
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              />
            </label>

            <label className="flex items-start gap-2 pt-7 text-sm text-ink-body">
              <input
                type="checkbox"
                checked={values.whatsappNotificationConsent}
                onChange={(event) =>
                  updateValue('whatsappNotificationConsent', event.target.checked)
                }
                className="mt-1"
              />
              Kirim notifikasi penting melalui WhatsApp.
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-ink">
              Tahu Mizan dari mana?
              <select
                value={values.referralSource}
                onChange={(event) =>
                  updateValue(
                    'referralSource',
                    event.target.value as OnboardingFormValues['referralSource'],
                  )
                }
                className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
              >
                <option value="SOCIAL_MEDIA">Media sosial</option>
                <option value="FRIEND">Teman / keluarga</option>
                <option value="COMMUNITY">Komunitas</option>
                <option value="SEARCH">Mesin pencari</option>
                <option value="EVENT">Acara / kampanye</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </label>

            {values.referralSource === 'OTHER' ? (
              <label className="space-y-2 text-sm font-medium text-ink">
                Jelaskan sumber lainnya
                <input
                  required
                  value={values.referralSourceOther}
                  onChange={(event) =>
                    updateValue('referralSourceOther', event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-line-soft bg-surface px-3 text-sm outline-none focus:border-brand-700"
                />
              </label>
            ) : null}
          </div>

          <label className="flex items-start gap-2 text-sm text-ink-body">
            <input
              type="checkbox"
              required
              checked={values.dataConsent}
              onChange={(event) => updateValue('dataConsent', event.target.checked)}
              className="mt-1"
            />
            Saya menyetujui penggunaan data untuk kebutuhan layanan Mizan.
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-md bg-brand-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Menyimpan profil…' : 'Simpan dan lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}
