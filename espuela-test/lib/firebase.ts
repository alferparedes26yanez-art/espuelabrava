// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAI0UkS8vvJ2gUpUU-og3TJ9o7RKVFPUUE",
  authDomain: "espuela-test.firebaseapp.com",
  projectId: "espuela-test",
  storageBucket: "espuela-test.firebasestorage.app",
  messagingSenderId: "1069323850067",
  appId: "1:1069323850067:web:6f1ad6bc071ebb1a4f51a6",
  measurementId: "G-PRHSNVJH4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
