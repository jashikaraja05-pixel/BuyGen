import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction,
  writeBatch,
  setLogLevel 
} from 'firebase/firestore';
import firebaseConfig from '../../../firebase-applet-config.json' with { type: 'json' };

// Silence internal gRPC idle stream disconnect warnings in Node.js
try {
  setLogLevel('silent');
} catch {
  // Ignore in case setLogLevel is unsupported in environment
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firestore with explicit database ID
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Collection references
export const collections = {
  users: collection(firestore, 'users'),
  products: collection(firestore, 'products'),
  categories: collection(firestore, 'categories'),
  brands: collection(firestore, 'brands'),
  carts: collection(firestore, 'carts'),
  wishlists: collection(firestore, 'wishlists'),
  orders: collection(firestore, 'orders'),
  reviews: collection(firestore, 'reviews'),
  offers: collection(firestore, 'offers'),
  paymentMethods: collection(firestore, 'payment_methods'),
  searchLogs: collection(firestore, 'search_logs'),
  loginLogs: collection(firestore, 'login_logs'),
  admins: collection(firestore, 'admins')
};

export { 
  collection,
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction, 
  writeBatch 
};
