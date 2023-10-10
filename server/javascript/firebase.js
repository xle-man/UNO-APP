// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
const firebase = require("firebase/app");
const firestore = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAfF3VMXbb0R6MMC8RSM9t1GNpr5Aqfi5k",
  authDomain: "uno-app-29e17.firebaseapp.com",
  projectId: "uno-app-29e17",
  storageBucket: "uno-app-29e17.appspot.com",
  messagingSenderId: "818758340068",
  appId: "1:818758340068:web:e803d4b5a6e0b80ffccbf1",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

module.exports =  {db};
