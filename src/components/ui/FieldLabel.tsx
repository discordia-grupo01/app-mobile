import { type ReactNode } from "react";
import { Text } from "react-native";

import { cn } from "../../lib/cn";

interface FieldLabelProps {
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldLabel({
  required = false,
  className,
  children,
}: FieldLabelProps) {
  return (
    <Text
      className={cn(
        "shrink text-[11px] font-bold tracking-[1.2px] uppercase text-content-subtle",
        className,
      )}
    >
      {children}
      {required ? <Text className="text-danger"> *</Text> : null}
    </Text>
  );
}
