import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

interface Column {
  key: string;
  header: string;
}

interface TableCardProps {
  title: string;
  subtitle: string;
  data: any[];
  columns: Column[];
  loading?: boolean;
}

const TableCard: React.FC<TableCardProps> = ({ title, subtitle, data, columns, loading }) => {
  const renderStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-amber-100 text-amber-800',
      completed: 'bg-emerald-100 text-emerald-800',
      processing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      payée: 'bg-emerald-100 text-emerald-800',
    };

    const colorClass = statusClasses[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreHorizontal size={20} className="text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="px-6 py-4 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item, itemIndex) => (
                    <tr key={itemIndex} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          {column.key === 'status'
                            ? renderStatusBadge(item[column.key])
                            : item[column.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
            <p className="text-sm text-gray-500">Showing {data.length} items</p>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View All
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TableCard;