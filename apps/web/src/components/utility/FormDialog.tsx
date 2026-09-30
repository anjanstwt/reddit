'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Block from '@/components/utility/Block';
import { cn } from '@/lib/utils';

interface FormDialogProps {
  title: string;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}

const isEditorFloating = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest('[data-editor-floating]');

export default function FormDialog({ title, onClose, className, children }: FormDialogProps) {
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => isEditorFloating(e.target) && e.preventDefault()}
        className={cn(
          'flex max-h-[85vh] max-w-[calc(100%-2rem)] flex-col rounded-xl border-0 bg-transparent p-0 shadow-none',
          className,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Block className="min-h-0 flex-1 shadow-2xl shadow-black/60">{children}</Block>
      </DialogContent>
    </Dialog>
  );
}
