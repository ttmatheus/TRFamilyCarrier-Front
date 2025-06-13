import React from "react";

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold text-gray-800 mb-6">{children}</h1>;
}
