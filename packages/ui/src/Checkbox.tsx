import type { ComponentProps } from 'react';

import { forwardRef, useId } from 'react';

import cn from '../cn';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'prefix'> {
  className?: string;
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function CheckBox({ className = '', label, ...props }, ref) {
    const id = useId();

    return (
      <div className="flex items-center">
        <input
          className={cn(
            'text-brand-500 focus:ring-brand-500 mr-2 cursor-pointer rounded border-gray-300 transition duration-200',
            className
          )}
          id={id}
          ref={ref}
          type="checkbox"
          {...props}
        />
        <label
          className="inline-block whitespace-nowrap text-sm text-gray-800 dark:text-gray-200"
          htmlFor={id}
        >
          {label}
        </label>
      </div>
    );
  }
);
