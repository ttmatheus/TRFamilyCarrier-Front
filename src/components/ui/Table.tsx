import React from "react";

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado",
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center px-4 py-6 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {columns.map((col, i) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row as any)[col.accessor];
                  return (
                    <td key={i} className="px-4 py-2">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
