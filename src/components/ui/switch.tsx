"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch@1.1.3";

import { cn } from "./utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
<<<<<<< HEAD
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#1DB954] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-[#1DB954] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
        "shadow-inner",
        className,
=======
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#1DB954] data-[state=unchecked]:bg-zinc-300 dark:data-[state=unchecked]:bg-zinc-700 shadow-inner",
        className
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
<<<<<<< HEAD
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0",
          "transition-transform duration-200 ease-in-out",
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
=======
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-xl ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 border border-zinc-200 dark:border-zinc-800"
>>>>>>> 36ab651fc45e4ea5236650b2c459320ba164a898
        )}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export { Switch };