export const TUNISIAN_GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Bizerte',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gafsa',
  'Tozeur',
  'Kebili',
  'Gabès',
  'Medenine',
  'Tataouine',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Zaghouan',
];

export const RADIUS_OPTIONS = [
  { value: '5', label: '5 km', desc: 'Quartier local' },
  { value: '10', label: '10 km', desc: 'Ville centrale' },
  { value: '15', label: '15 km', desc: 'Zone urbaine (standard)' },
  { value: '25', label: '25 km', desc: 'Grand Tunis / région' },
  { value: '50', label: '50 km', desc: 'Inter-villes' },
];

export const EXPERIENCE_OPTIONS = ['< 2 ans', '2 à 5 ans', '5 à 10 ans', '+ 10 ans'];

export const PROVIDER_STEPS = ['Identité', 'Zone & Tél', 'Domaines', 'Vérification'];

export interface RegisterForm {
  fullName: string;
  phoneDigits: string;
  email: string;
  password: string;
  cinNumber: string;
  defaultAddress: string;
  governorate: string;
  radiusKm: string;
  selectedCategories: string[];
  experience: string;
  bio: string;
}

export const EMPTY_FORM: RegisterForm = {
  fullName: '',
  phoneDigits: '',
  email: '',
  password: '',
  cinNumber: '',
  defaultAddress: '',
  governorate: 'Tunis',
  radiusKm: '15',
  selectedCategories: [],
  experience: '2 à 5 ans',
  bio: '',
};

export interface RegisterCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}
