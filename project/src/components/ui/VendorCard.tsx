import { Link } from 'react-router-dom';
import { Vendor } from '../../types';


interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  return (
    <Link 
      to={`/boutique/${vendor.id}/categories`} 
      className="block group"
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <img 
          src={vendor.logo || 'https://via.placeholder.com/150'} 
          alt={vendor.name} 
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{vendor.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500">{vendor.rating.toFixed(1)}</span>
            <svg 
              className="h-4 w-4 text-yellow-400 ml-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-gray-500 ml-2">({vendor.productsCount} produits)</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VendorCard;