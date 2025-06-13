import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className="tabs">
      {React.Children.map(children, (child: any) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { value, setValue });
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
}

export function TabsList({ children }: TabsListProps) {
  return <div className="flex space-x-2 border-b mb-4">{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  setValue?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsTrigger({
  value: triggerValue,
  setValue,
  children,
  ...props
}: TabsTriggerProps) {
  const isActive = props.value === triggerValue;

  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2",
        isActive
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      )}
      onClick={() => setValue?.(triggerValue)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  setValue?: (value: string) => void;
  children: React.ReactNode;
}

export function TabsContent({
  value: contentValue,
  children,
  ...props
}: TabsContentProps) {
  return props.value === contentValue ? <div>{children}</div> : null;
}
