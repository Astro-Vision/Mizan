'use client';

import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import { LogOut, Wallet } from 'lucide-react';

import { mzBtn } from '@/components/site/ui/mz-button';

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

export function AuthMenu({ mobile = false }: { mobile?: boolean }) {
  const { authenticated, ready, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  if (!ready) {
    return (
      <span className="text-xs font-medium text-ink-muted" aria-live="polite">
        Memuat…
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className={`${mzBtn(
          'outline',
          'sm',
          mobile ? 'w-full' : undefined,
        )} cursor-pointer`}
      >
        <Wallet className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Hubungkan Dompet
      </button>
    );
  }

  const accountLabel = user?.email?.address ?? user?.wallet?.address;
  const visibleLabel = accountLabel?.includes('@')
    ? accountLabel
    : accountLabel
      ? shortenAddress(accountLabel)
      : 'Akun terhubung';

  return (
    <div className={mobile ? 'flex w-full flex-col gap-2' : 'flex items-center gap-2'}>
      <span
        className="max-w-44 truncate text-xs font-medium text-ink-body"
        title={accountLabel ?? undefined}
      >
        {visibleLabel}
      </span>
      <button
        type="button"
        onClick={() => void logout()}
        className={mzBtn('ghost', 'sm', mobile ? 'w-full' : undefined)}
      >
        <LogOut className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Keluar
      </button>
    </div>
  );
}
