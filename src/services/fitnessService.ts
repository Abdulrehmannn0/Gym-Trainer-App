import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  CustomWorkoutPlan, 
  WorkoutLog, 
  BodyMeasurementLog, 
  SleepLog, 
  Habit, 
  HabitStatus, 
  PersonalRecord, 
  AppNotification, 
  Challenge,
  Meal
} from '../types';

// Custom Workout Plans
export async function getCustomWorkoutPlans(uid: string): Promise<CustomWorkoutPlan[]> {
  try {
    const plansRef = collection(db, 'users', uid, 'workout_plans');
    const snap = await getDocs(plansRef);
    const plans: CustomWorkoutPlan[] = [];
    snap.forEach((d) => {
      plans.push({ id: d.id, ...d.data() } as CustomWorkoutPlan);
    });
    return plans;
  } catch (error) {
    console.error('Error getting custom plans:', error);
    return [];
  }
}

export async function createCustomWorkoutPlan(uid: string, plan: Omit<CustomWorkoutPlan, 'id'>): Promise<CustomWorkoutPlan> {
  const plansRef = collection(db, 'users', uid, 'workout_plans');
  const newDoc = doc(plansRef);
  const fullPlan: CustomWorkoutPlan = {
    id: newDoc.id,
    ...plan
  };
  await setDoc(newDoc, fullPlan);
  return fullPlan;
}

export async function updateCustomWorkoutPlan(uid: string, planId: string, updates: Partial<CustomWorkoutPlan>): Promise<void> {
  const docRef = doc(db, 'users', uid, 'workout_plans', planId);
  await updateDoc(docRef, updates as any);
}

export async function deleteCustomWorkoutPlan(uid: string, planId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'workout_plans', planId);
  await deleteDoc(docRef);
}

// Workout Logs
export async function getWorkoutLogs(uid: string): Promise<WorkoutLog[]> {
  try {
    const logsRef = collection(db, 'users', uid, 'workout_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const logs: WorkoutLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as WorkoutLog);
    });
    return logs;
  } catch (error) {
    console.error('Error getting workout logs:', error);
    return [];
  }
}

export async function createWorkoutLog(uid: string, log: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> {
  const logsRef = collection(db, 'users', uid, 'workout_logs');
  const newDoc = doc(logsRef);
  const fullLog: WorkoutLog = {
    id: newDoc.id,
    ...log
  };
  await setDoc(newDoc, fullLog);
  return fullLog;
}

// Body Measurements
export async function getMeasurementLogs(uid: string): Promise<BodyMeasurementLog[]> {
  try {
    const ref = collection(db, 'users', uid, 'measurement_logs');
    const q = query(ref, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const logs: BodyMeasurementLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as BodyMeasurementLog);
    });
    return logs;
  } catch (error) {
    console.error('Error getting measurements:', error);
    return [];
  }
}

export async function createMeasurementLog(uid: string, log: Omit<BodyMeasurementLog, 'id' | 'timestamp'>): Promise<BodyMeasurementLog> {
  const ref = collection(db, 'users', uid, 'measurement_logs');
  const newDoc = doc(ref);
  const fullLog: BodyMeasurementLog = {
    id: newDoc.id,
    timestamp: new Date().toISOString(),
    ...log
  };
  await setDoc(newDoc, fullLog);
  return fullLog;
}

// Sleep Logs
export async function getSleepLogs(uid: string): Promise<SleepLog[]> {
  try {
    const ref = collection(db, 'users', uid, 'sleep_logs');
    const q = query(ref, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const logs: SleepLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as SleepLog);
    });
    return logs;
  } catch (error) {
    console.error('Error getting sleep logs:', error);
    return [];
  }
}

export async function createSleepLog(uid: string, log: Omit<SleepLog, 'id' | 'timestamp'>): Promise<SleepLog> {
  const ref = collection(db, 'users', uid, 'sleep_logs');
  const newDoc = doc(ref);
  const fullLog: SleepLog = {
    id: newDoc.id,
    timestamp: new Date().toISOString(),
    ...log
  };
  await setDoc(newDoc, fullLog);
  return fullLog;
}

// Habits
const DEFAULT_HABITS = [
  { name: 'Stretch for 10 minutes' },
  { name: 'Drink 3 Liters of water' },
  { name: 'Limit screen time before bed' },
  { name: 'Hit daily protein target' },
  { name: 'Complete planned workout' }
];

export async function getHabits(uid: string): Promise<Habit[]> {
  try {
    const ref = collection(db, 'users', uid, 'habits');
    const snap = await getDocs(ref);
    if (snap.empty) {
      // Seed default habits
      const seeded: Habit[] = [];
      for (const h of DEFAULT_HABITS) {
        const docRef = doc(ref);
        const item: Habit = {
          id: docRef.id,
          name: h.name,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, item);
        seeded.push(item);
      }
      return seeded;
    }
    const habits: Habit[] = [];
    snap.forEach((d) => {
      habits.push({ id: d.id, ...d.data() } as Habit);
    });
    return habits;
  } catch (error) {
    console.error('Error getting habits:', error);
    return [];
  }
}

export async function createHabit(uid: string, name: string): Promise<Habit> {
  const ref = collection(db, 'users', uid, 'habits');
  const newDoc = doc(ref);
  const item: Habit = {
    id: newDoc.id,
    name,
    createdAt: new Date().toISOString()
  };
  await setDoc(newDoc, item);
  return item;
}

export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'habits', habitId);
  await deleteDoc(docRef);
}

export async function getHabitStatuses(uid: string): Promise<HabitStatus[]> {
  try {
    const ref = collection(db, 'users', uid, 'habit_statuses');
    const snap = await getDocs(ref);
    const statuses: HabitStatus[] = [];
    snap.forEach((d) => {
      statuses.push({ id: d.id, ...d.data() } as HabitStatus);
    });
    return statuses;
  } catch (error) {
    console.error('Error getting habit statuses:', error);
    return [];
  }
}

export async function saveHabitStatus(uid: string, date: string, completedHabitIds: string[]): Promise<void> {
  const docRef = doc(db, 'users', uid, 'habit_statuses', date);
  const status: HabitStatus = {
    id: date,
    completedHabitIds
  };
  await setDoc(docRef, status);
}

// Personal Records
export async function getPersonalRecords(uid: string): Promise<PersonalRecord[]> {
  try {
    const ref = collection(db, 'users', uid, 'personal_records');
    const snap = await getDocs(ref);
    const records: PersonalRecord[] = [];
    snap.forEach((d) => {
      records.push({ id: d.id, ...d.data() } as PersonalRecord);
    });
    return records;
  } catch (error) {
    console.error('Error getting personal records:', error);
    return [];
  }
}

export async function addPersonalRecord(uid: string, record: Omit<PersonalRecord, 'id' | 'calculated1RM'>): Promise<PersonalRecord> {
  // 1RM = weight * (1 + reps / 30) - Epley formula
  const calculated1RM = record.weight * (1 + record.reps / 30);
  const ref = collection(db, 'users', uid, 'personal_records');
  const newDoc = doc(ref);
  const item: PersonalRecord = {
    id: newDoc.id,
    calculated1RM: Math.round(calculated1RM * 10) / 10,
    ...record
  };
  await setDoc(newDoc, item);
  return item;
}

// Notifications & Reminders
export async function getNotifications(uid: string): Promise<AppNotification[]> {
  try {
    const ref = collection(db, 'users', uid, 'notifications');
    const snap = await getDocs(ref);
    if (snap.empty) {
      // Create some initial notifications
      const initial: AppNotification[] = [
        {
          id: 'welcome',
          title: 'Welcome to AzharFit AI!',
          body: 'Your athletic profile is ready. Create a custom workout plan or log your first training session!',
          date: new Date().toLocaleDateString(),
          read: false,
          type: 'achievement'
        }
      ];
      for (const n of initial) {
        await setDoc(doc(ref, n.id), n);
      }
      return initial;
    }
    const notifs: AppNotification[] = [];
    snap.forEach((d) => {
      notifs.push({ id: d.id, ...d.data() } as AppNotification);
    });
    return notifs;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function addNotification(uid: string, notif: Omit<AppNotification, 'id' | 'date' | 'read'>): Promise<AppNotification> {
  const ref = collection(db, 'users', uid, 'notifications');
  const newDoc = doc(ref);
  const item: AppNotification = {
    id: newDoc.id,
    date: new Date().toLocaleDateString(),
    read: false,
    ...notif
  };
  await setDoc(newDoc, item);
  return item;
}

export async function markNotificationAsRead(uid: string, notifId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'notifications', notifId);
  await updateDoc(docRef, { read: true });
}

// Challenges
const DEFAULT_CHALLENGES: Omit<Challenge, 'joined' | 'progress' | 'completed'>[] = [
  {
    id: 'weekly-strength',
    title: 'Savage Strength Quest',
    description: 'Log 4 compound strength workout sessions in the simulator.',
    type: 'weekly',
    target: 4,
    unit: 'sessions',
    deadline: 'End of this week'
  },
  {
    id: 'weekly-hydration',
    title: 'Hydro Athlete Crusade',
    description: 'Log 2,500ml or more of water on 5 separate days.',
    type: 'weekly',
    target: 5,
    unit: 'days',
    deadline: 'End of this week'
  },
  {
    id: 'monthly-volume',
    title: '1,000 Minute Titan',
    description: 'Amass 1,000 minutes or more of active workout duration.',
    type: 'monthly',
    target: 1000,
    unit: 'minutes',
    deadline: 'End of this month'
  },
  {
    id: 'monthly-cal-burn',
    title: 'Fat Incineration Protocol',
    description: 'Incinerate a total of 8,000 extra calories from logged workouts.',
    type: 'monthly',
    target: 8000,
    unit: 'kcal',
    deadline: 'End of this month'
  }
];

export async function getChallenges(uid: string): Promise<Challenge[]> {
  try {
    const ref = collection(db, 'users', uid, 'challenges');
    const snap = await getDocs(ref);
    if (snap.empty) {
      const seeded: Challenge[] = [];
      for (const c of DEFAULT_CHALLENGES) {
        const item: Challenge = {
          ...c,
          joined: true,
          progress: 0,
          completed: false
        };
        await setDoc(doc(ref, c.id), item);
        seeded.push(item);
      }
      return seeded;
    }
    const challenges: Challenge[] = [];
    snap.forEach((d) => {
      challenges.push({ id: d.id, ...d.data() } as Challenge);
    });
    return challenges;
  } catch (error) {
    console.error('Error getting challenges:', error);
    return [];
  }
}

export async function joinChallenge(uid: string, challengeId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'challenges', challengeId);
  await updateDoc(docRef, { joined: true });
}

export async function updateChallengeProgress(uid: string, challengeId: string, progressAmt: number, add: boolean = true): Promise<void> {
  const docRef = doc(db, 'users', uid, 'challenges', challengeId);
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'challenges'));
    const docData = snap.docs.find(d => d.id === challengeId)?.data() as Challenge | undefined;
    if (docData) {
      const newProgress = add ? (docData.progress + progressAmt) : progressAmt;
      const completed = newProgress >= docData.target;
      await updateDoc(docRef, { 
        progress: Math.min(newProgress, docData.target),
        completed
      });
    }
  } catch (err) {
    console.error('Error updating challenge:', err);
  }
}

// Meal CRUD & Nutrition Hub
export async function getMeals(uid: string, dateStr?: string): Promise<Meal[]> {
  try {
    const ref = collection(db, 'users', uid, 'meals');
    const q = query(ref, orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    const meals: Meal[] = [];
    snap.forEach((d) => {
      const data = d.data() as Meal;
      if (!dateStr || data.date === dateStr) {
        meals.push({ id: d.id, ...data });
      }
    });
    return meals;
  } catch (error) {
    console.error('Error getting meals from Firestore:', error);
    return [];
  }
}

export async function createMeal(uid: string, meal: Omit<Meal, 'id'>): Promise<Meal> {
  const ref = collection(db, 'users', uid, 'meals');
  const newDoc = doc(ref);
  const fullMeal: Meal = {
    id: newDoc.id,
    ...meal
  };
  await setDoc(newDoc, fullMeal);
  return fullMeal;
}

export async function deleteMeal(uid: string, mealId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'meals', mealId);
  await deleteDoc(docRef);
}

export async function updateMeal(uid: string, mealId: string, updates: Partial<Meal>): Promise<void> {
  const docRef = doc(db, 'users', uid, 'meals', mealId);
  await updateDoc(docRef, updates as any);
}

export async function deleteSleepLog(uid: string, logId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'sleep_logs', logId);
  await deleteDoc(docRef);
}

export async function deleteMeasurementLog(uid: string, logId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'measurement_logs', logId);
  await deleteDoc(docRef);
}

export async function deletePersonalRecord(uid: string, recordId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'personal_records', recordId);
  await deleteDoc(docRef);
}


