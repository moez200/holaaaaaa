import React from 'react';
import { Produit } from '../../types';


interface ProductTableProps {
  products: Produit[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendus
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              En Stock
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                 <div className="h-10 w-10 flex-shrink-0 mr-3">
  {product.image ? (
    <img
      src={
        product.image.startsWith('http')
          ? product.image
          : `http://localhost:8000${product.image}`
      }
      alt={product.nom}
      className="h-10 w-10 rounded-md object-cover"
    />
  ) : (
    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
      No image
    </div>
  )}
</div>

                  <div className="text-sm font-medium text-gray-900">{product.nom}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{product.category_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.prix !== null && product.prix !== undefined
                    ? `${product.prix.toFixed(2)} €`
                    : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{product.total_sold}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.stock > 10 ? 'bg-green-100 text-green-800' : 
                  product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stock}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;