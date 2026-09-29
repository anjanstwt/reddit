'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormField from '@/components/utility/FormField';
import SignInPrompt from '@/components/utility/SignInPrompt';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useCreateCommunity } from '@/hooks/useCommunity';
import { errorMessage } from '@/lib/server/fetcher';

const namePattern = /^[a-z0-9_]{3,21}$/;

export default function CreateCommunityForm() {
  const router = useRouter();
  const { token, ready } = useAccessToken();
  const create = useCreateCommunity();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!ready) return null;
  if (!token) return <SignInPrompt message="Log in to start a community" />;

  const validName = namePattern.test(name);
  const canSubmit = validName && title.trim().length > 0 && !create.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { name, title: title.trim(), description: description.trim() },
      { onSuccess: (community) => router.push(`/r/${community.name}`) },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <FormField label="Name" htmlFor="name" hint="3-21 characters: a-z, 0-9 or _. This can't be changed later.">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-steel">r/</span>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            maxLength={21}
            className="h-10 pl-8"
            autoFocus
          />
        </div>
      </FormField>

      <FormField label="Title" htmlFor="title" hint="Shown at the top of your community.">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="h-10" />
      </FormField>

      <FormField label="Description" htmlFor="description" hint="Optional, up to 500 characters.">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={4}
        />
      </FormField>

      {create.isError && <p className="px-1 text-sm text-red-400">{errorMessage(create.error)}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {create.isPending ? 'Creating…' : 'Create community'}
        </Button>
      </div>
    </form>
  );
}
