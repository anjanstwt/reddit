'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  // A failed refresh means the Go session is gone; treat it as signed out.
  if (!session || session.error) {
    return (
      <button
        onClick={() => signIn('google')}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Continue with Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{session.user.name}</span>
      <button onClick={() => signOut()} className="rounded-md border px-4 py-2 text-sm font-medium">
        Sign out
      </button>
    </div>
  );
}
