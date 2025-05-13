import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { UserSignupData } from '../types';
import { register } from '../services/authService';

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: 'client' | 'marchand' | 'admin';
  password: string;
  confirm_password: string;
  referral_code: string;
  has_referral: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

const RegisterPage = () => {
  const [formState, setFormState] = useState<FormState>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    role: 'client',
    password: '',
    confirm_password: '',
    referral_code: '',
    has_referral: false,
    showPassword: false,
    showConfirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, has_referral: e.target.checked }));
  };

  const togglePasswordVisibility = (field: 'showPassword' | 'showConfirmPassword') => {
    setFormState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const {
        nom,
        prenom,
        email,
        telephone,
        adresse,
        role,
        password,
        confirm_password,
        referral_code,
        has_referral,
    } = formState;

    if (!nom || !prenom || !email || !telephone || !adresse || !password || !confirm_password) {
        toast.error('Veuillez remplir tous les champs');
        return;
    }

    if (password !== confirm_password) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
    }

    if (password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        return;
    }

    if (has_referral && !referral_code) {
        toast.error('Veuillez entrer un code de parrainage');
        return;
    }

    const userData: UserSignupData = {
        nom,
        prenom,
        email,
        telephone,
        adresse,
        role,
        password,
        confirm_password,
        ...(has_referral && referral_code && { referral_code }),
    };

    console.log('Submitting user data:', userData); // Debug payload

    try {
        setIsLoading(true);
        await register(userData);
        toast.success('Inscription réussie!');
        navigate('/login');
    } catch (error: any) {
        console.error('Registration error:', error.response?.data || error);
        const errors = error.response?.data?.errors || {};
        let errorMessage = 'Échec de l\'inscription. Veuillez réessayer.';
        if (Object.keys(errors).length > 0) {
            errorMessage = Object.entries(errors)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('; ');
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        }
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>

            <form onSubmit={handleSubmit}>
              {/* Existing fields */}
              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formState.nom}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Dupont"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={formState.prenom}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Jean"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formState.telephone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  id="adresse"
                  name="adresse"
                  type="text"
                  value={formState.adresse}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="123 Rue Exemple, Ville"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={formState.role}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="client">Client</option>
                  <option value="marchand">Marchand</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formState.has_referral}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Avez-vous un code de parrainage ?
                  </span>
                </label>
                {formState.has_referral && (
                  <input
                    id="referral_code"
                    name="referral_code"
                    type="text"
                    value={formState.referral_code}
                    onChange={handleInputChange}
                    className="input mt-2"
                    placeholder="Entrez le code de parrainage"
                  />
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={handleInputChange}
                    className="input pr-10"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('showPassword')}
                  >
                    {formState.showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={formState.showConfirmPassword ? 'text' : 'password'}
                    value={formState.confirm_password}
                    onChange={handleInputChange}
                    className="input pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility('showConfirmPassword')}
                  >
                    {formState.showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Inscription en cours...
                  </span>
                ) : (
                  "S'inscrire"
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                En vous inscrivant, vous acceptez nos{' '}
                <Link to="/terms" className="text-primary hover:text-primary-dark">
                  Conditions d'utilisation
                </Link>{' '}
                et notre{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-dark">
                  Politique de confidentialité
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;