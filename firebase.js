import { initializeApp } from 'firebase/app';
import {getAnalytics} from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "xxxxx",
 authDomain: "inventory-management-xxxxx.firebaseapp.com",
 projectId: "inventory-management-xxxxx",
 storageBucket: "inventory-management-xxxxx.appspot.com",
 messagingSenderId: "xxxxx",
 appId: "xxxxx"
 };
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };
