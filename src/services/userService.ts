import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Creates or updates a user profile document in Firestore.
 */
export async function createUserProfile(user: FirebaseUser, name: string): Promise<UserProfile> {
  const profile: UserProfile = {
    uid: user.uid,
    name: name || user.displayName || 'Gym Member',
    email: user.email || '',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, USERS_COLLECTION, user.uid), profile);
  
  // Also update Auth profile display name and photoURL if needed
  await updateProfile(user, {
    displayName: profile.name,
    photoURL: profile.photoURL
  });

  return profile;
}

/**
 * Fetches user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Updates an existing user's profile details in Firestore and Auth.
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found');

  // Update Firestore
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, updates as any);

  // Update Firebase Auth Profile
  const authUpdates: { displayName?: string; photoURL?: string } = {};
  if (updates.name) authUpdates.displayName = updates.name;
  if (updates.photoURL) authUpdates.photoURL = updates.photoURL;

  if (Object.keys(authUpdates).length > 0) {
    await updateProfile(user, authUpdates);
  }
}
