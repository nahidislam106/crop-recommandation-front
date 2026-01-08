import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJXOGRfs5rtCXfewRl2FnX4grltbykPn0",
  authDomain: "crop-app-9fd83.firebaseapp.com",
  databaseURL: "https://crop-app-9fd83-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "crop-app-9fd83",
  storageBucket: "crop-app-9fd83.firebasestorage.app",
  messagingSenderId: "323210847164",
  appId: "1:323210847164:web:f09453bf8bb3b35b70c1b9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);