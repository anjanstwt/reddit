import { Children, Fragment, isValidElement } from 'react';

import Divider from '@/components/utility/Divider';
import { cn } from '@/lib/utils';

export default function SeparatedList({ className, children }: { className?: string; children: React.ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, i) => (
        <Fragment key={item.key ?? i}>
          {i > 0 && <Divider />}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
