import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: LucideIcon;
  label: string;
}

export default function IconButton({ icon: Icon, label, ...props }: IconButtonProps) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} {...props}>
      <Icon size={20} strokeWidth={1.75} />
    </Button>
  );
}
