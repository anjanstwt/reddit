'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Block from '@/components/utility/Block';
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
    <Block className="w-full transition-colors focus-within:bg-[#1a1a1a] shadow-md border border-[#292929] ">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="min-h-20 resize-none rounded-none bg-transparent px-4 pt-3 pb-1 hover:bg-transparent focus-visible:bg-transparent"
      />
      <div className="flex w-full items-center justify-end gap-2 px-3 pb-3">
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
    </Block>
  );
}
