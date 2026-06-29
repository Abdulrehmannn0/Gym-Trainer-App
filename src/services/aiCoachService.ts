import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface AIChatMessage {
  id?: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: string; // e.g. 'general' | 'workout' | 'meal' | 'analysis' | 'motivation'
  isError?: boolean;
}

export interface AIRecommendation {
  id?: string;
  type: 'workout' | 'meal' | 'report' | 'goal' | 'correction';
  title: string;
  content: any; // Can be a string, markdown, or JSON
  createdAt: string;
  prompt: string;
}

// AI Chat Messages History
export async function getAIChatMessages(uid: string): Promise<AIChatMessage[]> {
  try {
    const chatRef = collection(db, 'users', uid, 'ai_chats');
    const q = query(chatRef, orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    const messages: AIChatMessage[] = [];
    snap.forEach((d) => {
      messages.push({ id: d.id, ...d.data() } as AIChatMessage);
    });
    return messages;
  } catch (error) {
    console.error('Error getting AI chat messages:', error);
    return [];
  }
}

export async function saveAIChatMessage(uid: string, message: Omit<AIChatMessage, 'id'>): Promise<AIChatMessage> {
  const chatRef = collection(db, 'users', uid, 'ai_chats');
  const newDoc = doc(chatRef);
  const fullMessage: AIChatMessage = {
    id: newDoc.id,
    ...message
  };
  await setDoc(newDoc, fullMessage);
  return fullMessage;
}

export async function clearAIChatHistory(uid: string): Promise<void> {
  try {
    const chatRef = collection(db, 'users', uid, 'ai_chats');
    const snap = await getDocs(chatRef);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'users', uid, 'ai_chats', d.id));
    }
  } catch (error) {
    console.error('Error clearing AI chat history:', error);
  }
}

// AI Recommendations
export async function getAIRecommendations(uid: string): Promise<AIRecommendation[]> {
  try {
    const recRef = collection(db, 'users', uid, 'ai_recommendations');
    const q = query(recRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const recs: AIRecommendation[] = [];
    snap.forEach((d) => {
      recs.push({ id: d.id, ...d.data() } as AIRecommendation);
    });
    return recs;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return [];
  }
}

export async function saveAIRecommendation(uid: string, recommendation: Omit<AIRecommendation, 'id'>): Promise<AIRecommendation> {
  const recRef = collection(db, 'users', uid, 'ai_recommendations');
  const newDoc = doc(recRef);
  const fullRec: AIRecommendation = {
    id: newDoc.id,
    ...recommendation
  };
  await setDoc(newDoc, fullRec);
  return fullRec;
}

export async function deleteAIRecommendation(uid: string, id: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'ai_recommendations', id);
  await deleteDoc(docRef);
}
