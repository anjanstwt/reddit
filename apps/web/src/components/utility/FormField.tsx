import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export default function FormField({ label, htmlFor, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="px-1 text-sm font-medium text-neutral-200">
        {label}
      </label>
      {children}
      {hint && <p className="px-1 text-xs text-steel">{hint}</p>}
    </div>
  );
}
