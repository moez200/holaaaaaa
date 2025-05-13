import { Link } from 'react-router-dom';
import { CategoryBoutique } from '../../types';

interface CategoryCardProps {
  category: CategoryBoutique;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`/category-boutiques/${category.id}`} 
      className="block group"
    >
      <div className="relative rounded-lg overflow-hidden aspect-square">
        <img 
          src={category.image || 'https://via.placeholder.com/300'} 
          alt={category.nom} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
          <h3 className="text-white font-medium text-lg">{category.nom}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;