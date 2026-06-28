import { collection, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Exercise } from '../types';
import { SAMPLE_EXERCISES } from '../data/exercises';

const EXERCISES_COLLECTION = 'exercises';

/**
 * Seeds the Firestore database with sample exercises if the collection is empty.
 */
export async function seedExercisesIfEmpty(): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(db, EXERCISES_COLLECTION);
    const querySnapshot = await getDocs(exercisesRef);

    if (querySnapshot.empty) {
      console.log('Exercises collection is empty. Seeding 20 sample exercises...');
      const batch = writeBatch(db);

      SAMPLE_EXERCISES.forEach((exercise) => {
        const docRef = doc(db, EXERCISES_COLLECTION, exercise.id);
        batch.set(docRef, exercise);
      });

      await batch.commit();
      console.log('Seeding completed successfully.');
      return SAMPLE_EXERCISES;
    } else {
      const exercises: Exercise[] = [];
      querySnapshot.forEach((doc) => {
        exercises.push(doc.data() as Exercise);
      });
      return exercises;
    }
  } catch (error) {
    console.error('Error seeding/fetching exercises from Firestore:', error);
    // Return sample exercises as a fallback so the app always works
    return SAMPLE_EXERCISES;
  }
}

/**
 * Fetches all exercises from Firestore.
 */
export async function getExercises(): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(db, EXERCISES_COLLECTION);
    const querySnapshot = await getDocs(exercisesRef);
    
    if (querySnapshot.empty) {
      // Seed if empty and return the seeded list
      return await seedExercisesIfEmpty();
    }

    const exercises: Exercise[] = [];
    querySnapshot.forEach((doc) => {
      exercises.push(doc.data() as Exercise);
    });
    return exercises;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return SAMPLE_EXERCISES; // Fallback
  }
}

/**
 * Fetches a single exercise by ID.
 */
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Exercise;
    } else {
      // Fallback to local sample if not found in db yet
      const local = SAMPLE_EXERCISES.find(ex => ex.id === id);
      return local || null;
    }
  } catch (error) {
    console.error(`Error fetching exercise with ID ${id}:`, error);
    const local = SAMPLE_EXERCISES.find(ex => ex.id === id);
    return local || null;
  }
}
