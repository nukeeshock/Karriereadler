import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <div
      data-state={open ? 'open' : 'closed'}
      className={cn(open ? 'fixed inset-0 z-50 flex items-center justify-center' : 'hidden')}
      aria-hidden={!open}
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
}

export function DialogTrigger({ children, ...props }: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function DialogContent({
  className,
  children,
  onClose
}: HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'relative z-50 w-full max-w-lg rounded-2xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-2xl p-6',
        className
      )}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/60 p-2 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />
  );
}

export function DialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  );
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-600', className)} {...props} />
  );
}

export function DialogClose({
  children,
  onClick,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  if (asChild && isValidElement(children)) {
    // Clone the child element and merge the onClick handler
    const childProps = children.props as any;
    return cloneElement(children, {
      ...props,
      onClick: (e: any) => {
        onClick?.(e);
        // Call the child's original onClick if it exists
        if (childProps.onClick) {
          childProps.onClick(e);
        }
      }
    } as any);
  }
  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}
