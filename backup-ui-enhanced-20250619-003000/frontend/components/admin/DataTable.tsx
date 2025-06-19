'use client'

import { useState } from 'react'

interface Column {
  header: string;
  accessor: string;
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (item: any) => void;
  emptyMessage?: string;
}

export const DataTable = ({
  data,
  columns,
  isLoading = false,
  error = null,
  onRowClick,
  emptyMessage = 'No data found'
}: DataTableProps) => {
  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                        {column.render ? (
                          column.render(item)
                        ) : (
                          <div className="text-sm text-gray-900">
                            {column.accessor === 'actions' ? null : item[column.accessor]}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable; 