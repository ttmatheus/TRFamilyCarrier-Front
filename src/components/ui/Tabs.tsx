// src/components/ui/Tabs.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Certifique-se de que o caminho para 'cn' está correto aqui

// Usamos React.Context para gerenciar o estado globalmente entre os componentes Tabs.
// Isso evita o "prop drilling" (passar props manualmente por vários níveis).
interface TabsContextType {
  selectedValue: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

// Hook para consumir o contexto em qualquer componente filho de Tabs
function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("useTabsContext must be used within a <Tabs> component");
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  const contextValue = React.useMemo(() => ({ selectedValue: value, setValue }), [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("tabs", className)}>
        {children} {/* Não precisa clonar aqui, os filhos acessam via Context */}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("flex space-x-2 border-b mb-4", className)}>
      {children} {/* Children (TabsTrigger) acessam via Context */}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { selectedValue, setValue } = useTabsContext(); // Obtém o estado do contexto
  const isActive = selectedValue === value;

  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2",
        isActive
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700",
        className
      )}
      onClick={() => setValue(value)} // Usa a função do contexto
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { selectedValue } = useTabsContext(); // Obtém o estado do contexto
  return selectedValue === value ? <div className={cn(className)}>{children}</div> : null;
}