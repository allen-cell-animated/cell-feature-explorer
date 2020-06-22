import "@firebase/analytics";
import { firebase } from "@firebase/app";
import "@firebase/firestore";
// import { FirebaseFirestore } from "firebase/firestore-types";

const firebaseConfig = {
    apiKey: "AIzaSyD691xhXsWl-8QU_9htjZnMUd7siWVCTAE",
    appId: "1:40711248674:web:511cb4cede47191274237b",
    authDomain: "allen-cell-resource.firebaseapp.com",
    databaseURL: "https://allen-cell-resource.firebaseio.com",
    measurementId: "G-8553S8ESS7",
    messagingSenderId: "40711248674",
    projectId: "allen-cell-resource",
    storageBucket: "allen-cell-resource.appspot.com",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const firestore = firebase.firestore();

export {
    firebase,
    firestore,
};

export default firestore;
