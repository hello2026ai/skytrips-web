import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../../lib/utils';

interface DualRangeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatValue?: (value: number) => string;
  className?: string;
  showRange?: boolean;
  onValueChangeStart?: () => void;
  onValueChangeComplete?: (value: number[]) => void;
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(
  (
    {
      className,
      formatValue,
      showRange = true,
      onValueChangeStart,
      onValueChangeComplete,
      ...props
    },
    ref
  ) => (
    <div className="space-y-3">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        onPointerDown={onValueChangeStart}
        onPointerUp={(e) => {
          if (
            onValueChangeComplete &&
            props.value &&
            Array.isArray(props.value)
          ) {
            onValueChangeComplete(props.value);
          }
        }}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-indigo-950" />
        </SliderPrimitive.Track>
        {props.value &&
          Array.isArray(props.value) &&
          props.value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className="block h-4 w-4 rounded-full bg-primary  bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            />
          ))}
      </SliderPrimitive.Root>
      {showRange &&
        props.value &&
        Array.isArray(props.value) &&
        formatValue && (
          <div className="label-l3 text-neutral-dark">
            {formatValue(props.value[0])} - {formatValue(props.value[1])}
          </div>
        )}
    </div>
  )
);

DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
