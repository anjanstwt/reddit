'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SignInPrompt from '@/components/utility/SignInPrompt';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useReply } from '@/hooks/useThread';
import { errorMessage } from '@/lib/server/fetcher';

interface ReplyBoxProps {
  postId: string;
  parentId: string;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}

export default function ReplyBox({ postId, parentId, placeholder = 'Add a comment', autoFocus, onDone }: ReplyBoxProps) {
  const { token, ready } = useAccessToken();
  const [text, setText] = useState('');
  const reply = useReply(postId);

  if (ready && !token) return <SignInPrompt message="Log in to join the conversation" className="py-6" />;

  const submit = () =>
    reply.mutate(
      { parentId, text },
      {
        onSuccess: () => {
          setText('');
          onDone?.();
        },
      },
    );

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
      />
      <div className="flex items-center justify-end gap-2">
        {reply.isError && <p className="mr-auto px-1 text-xs text-red-400">{errorMessage(reply.error)}</p>}
        {onDone && (
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={submit} disabled={!text.trim() || reply.isPending}>
          {reply.isPending ? 'Posting…' : 'Comment'}
        </Button>
      </div>
    </div>
  );
}
