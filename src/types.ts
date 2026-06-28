export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  fitnessGoal?: string;
  experienceLevel?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  equipment: string;
  description: string;
  instructions: string[];
  recommendedSets: string;
  benefits: string[];
}
