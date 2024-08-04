import { initializeApp } from 'firebase/app';
import {getAnalytics} from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "AIzaSyC9_l-n1XXVwZo0PXwBh-0GzADYXS-phGQ",
 authDomain: "inventory-management-fir-8c3bf.firebaseapp.com",
 projectId: "inventory-management-fir-8c3bf",
 storageBucket: "inventory-management-fir-8c3bf.appspot.com",
 messagingSenderId: "314539803333",
 appId: "1:314539803333:web:2f250e252c6a98c6a3a6ac"
 };
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };
