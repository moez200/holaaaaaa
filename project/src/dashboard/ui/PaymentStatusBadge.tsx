import React from 'react';

interface PaymentStatusBadgeProps {
  status: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  let color = '';
  
  switch (status) {
    case 'Completed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'Pending':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Failed':
      color = 'bg-red-100 text-red-800';
      break;
    case 'Refunded':
      color = 'bg-purple-100 text-purple-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Complété';
      case 'Pending':
        return 'En attente';
      case 'Failed':
        return 'Échoué';
      case 'Refunded':
        return 'Remboursé';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {getStatusText(status)}
    </span>
  );
};

export default PaymentStatusBadge;