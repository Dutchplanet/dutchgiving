export type AgeGroup = 'child' | 'teen' | 'adult';
export type Gender = 'male' | 'female' | 'other';

export interface Person {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  gender: Gender;
  interests: string[];
  shareCode: string;
  createdAt: number;
  ownerId: string;
  photoUrl?: string;
  budget?: number;
  pin?: string;
}

export interface WishlistItem {
  id: string;
  personId: string;
  name: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  note?: string;
  purchased: boolean;
  order: number;
  createdAt: number;
}

export interface Suggestion {
  id: string;
  name: string;
  imageUrl: string;
  priceRange: string;
  targetAgeGroups: AgeGroup[];
  targetGenders: Gender[];
  targetInterests: string[];
}

export const INTERESTS = [
  { id: 'baby', label: 'Baby & Peuter', icon: '🍼' },
  { id: 'technology', label: 'Technologie', icon: '💻' },
  { id: 'sports', label: 'Sport', icon: '⚽' },
  { id: 'reading', label: 'Lezen', icon: '📚' },
  { id: 'cooking', label: 'Koken', icon: '🍳' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'music', label: 'Muziek', icon: '🎵' },
  { id: 'fashion', label: 'Mode', icon: '👗' },
  { id: 'garden', label: 'Tuin', icon: '🌱' },
  { id: 'crafts', label: 'Knutselen', icon: '✂️' },
  { id: 'travel', label: 'Reizen', icon: '✈️' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'pets', label: 'Huisdieren', icon: '🐾' },
  { id: 'home', label: 'Wonen', icon: '🏠' },
] as const;

export const AGE_GROUPS = [
  { id: 'child' as AgeGroup, label: 'Kind (0-12)', description: 'Speelgoed, boeken, creatief' },
  { id: 'teen' as AgeGroup, label: 'Tiener (13-17)', description: 'Tech, mode, gaming' },
  { id: 'adult' as AgeGroup, label: 'Volwassene (18+)', description: 'Alles!' },
] as const;

export const GENDERS = [
  { id: 'male' as Gender, label: 'Man' },
  { id: 'female' as Gender, label: 'Vrouw' },
  { id: 'other' as Gender, label: 'Anders' },
] as const;
