'use client';

import { useEffect, useRef, useState } from 'react';
import { useIdentityToken, usePrivy } from '@privy-io/react-auth';

import { OnboardingModal } from '@/components/auth/onboarding-modal';

export function AuthSync() {
  const { authenticated, ready, user } = usePrivy();
  const { identityToken } = useIdentityToken();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const inFlightRequests = useRef(new Set<string>());
  const linkedAccountSignature =
    user?.linkedAccounts
      .map((account) => {
        const address =
          'address' in account && typeof account.address === 'string'
            ? account.address
            : '';
        return `${account.type}:${address}`;
      })
      .join('|') ?? '';

  useEffect(() => {
    if (!ready || !authenticated || !identityToken) {
      setOnboardingRequired(() => false);
      return;
    }

    const requestKey = `${identityToken}:${linkedAccountSignature}`;

    if (inFlightRequests.current.has(requestKey)) {
      return;
    }

    inFlightRequests.current.add(requestKey);

    const syncUser = async () => {
      try {
        const response = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: {
            'privy-id-token': identityToken,
          },
        });

        const body = (await response.json().catch(() => null)) as {
          onboardingRequired?: boolean;
          error?: string;
          details?: string;
        } | null;

        if (!response.ok) {
          throw new Error(
            `Auth sync failed with status ${response.status}: ${body?.error ?? 'UNKNOWN_ERROR'}${body?.details ? ` (${body.details})` : ''}`,
          );
        }

        setSyncError(null);
        setOnboardingRequired(body?.onboardingRequired === true);
      } catch (error) {
        console.error('Auth sync request failed', error);
        setSyncError('Sinkronisasi akun gagal. Coba muat ulang halaman.');
      } finally {
        inFlightRequests.current.delete(requestKey);
      }
    };

    void syncUser();
  }, [authenticated, identityToken, linkedAccountSignature, ready]);

  return (
    <>
      {syncError ? (
        <p
          className="fixed inset-x-4 bottom-4 z-[60] rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          {syncError}
        </p>
      ) : null}
      {onboardingRequired && identityToken ? (
        <OnboardingModal
          identityToken={identityToken}
          onCompleted={() => setOnboardingRequired(false)}
        />
      ) : null}
    </>
  );
}
