import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = '';
  
  switch (status) {
    case 'En attente':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Payée':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'En préparation':
      color = 'bg-purple-100 text-purple-800';
      break;
    case 'Expédiée':
      color = 'bg-indigo-100 text-indigo-800';
      break;
    case 'Livrée':
      color = 'bg-green-100 text-green-800';
      break;
    case 'Annulée':
      color = 'bg-red-100 text-red-800';
      break;
    case 'Remboursée':
      color = 'bg-gray-100 text-gray-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;