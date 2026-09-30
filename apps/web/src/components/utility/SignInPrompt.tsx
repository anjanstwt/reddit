'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import Block from '@/components/utility/Block';
import { cn } from '@/lib/utils';

export default function SignInPrompt({ message = 'Log in to continue', className }: { message?: string; className?: string }) {
  return (
    <Block className={cn('w-full items-center gap-3 px-6 py-10 text-center text-sm text-steel', className)}>
      {message}
      <Button onClick={() => signIn('google')}>Log In</Button>
    </Block>
  );
}
