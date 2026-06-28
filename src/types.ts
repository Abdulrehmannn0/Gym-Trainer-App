export interface MetricLog {
  date: string;
  value: number;
}

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
  
  // Advanced metrics & tracking fields
  favorites?: string[];
  recentlyViewed?: string[];
  weightHistory?: MetricLog[];
  caloriesHistory?: MetricLog[];
  waterHistory?: MetricLog[];
  streak?: number;
  completedWorkoutsCount?: number;
  achievements?: string[];
  waterIntakeGoal?: number; // ml
  caloriesBurnedGoal?: number; // kcal
  workoutDurationGoal?: number; // mins
  workoutFrequency?: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun] count
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
  safetyTips?: string[];
}

export interface CustomWorkoutPlan {
  id: string;
  title: string;
  description: string;
  duration: number; // mins
  calories: number; // kcal
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  category: string;
  exercises: { name: string; sets: number; reps: string }[];
  scheduledDates?: string[]; // YYYY-MM-DD format
  createdAt: string;
}

export interface WorkoutLog {
  id: string;
  planId?: string;
  title: string;
  duration: number; // mins
  calories: number; // kcal
  date: string; // YYYY-MM-DD
  timestamp: string;
  exercises: {
    name: string;
    sets: {
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
}

export interface BodyMeasurementLog {
  id: string;
  date: string; // YYYY-MM-DD
  chest?: number; // cm
  armsRight?: number;
  armsLeft?: number;
  waist?: number;
  hips?: number;
  thighsRight?: number;
  thighsLeft?: number;
  calves?: number;
  timestamp: string;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent' | string;
  notes?: string;
  timestamp: string;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
}

export interface HabitStatus {
  id: string; // YYYY-MM-DD
  completedHabitIds: string[];
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number; // kg
  reps: number;
  date: string;
  calculated1RM: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: 'streak' | 'achievement' | 'reminder' | 'challenge' | string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly';
  target: number;
  unit: string;
  progress: number;
  completed: boolean;
  joined: boolean;
  deadline: string;
}
