import { firebase } from '@firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "@firebase/analytics";
import '@firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD691xhXsWl-8QU_9htjZnMUd7siWVCTAE",
    authDomain: "allen-cell-resource.firebaseapp.com",
    databaseURL: "https://allen-cell-resource.firebaseio.com",
    projectId: "allen-cell-resource",
    storageBucket: "allen-cell-resource.appspot.com",
    messagingSenderId: "40711248674",
    appId: "1:40711248674:web:511cb4cede47191274237b",
    measurementId: "G-8553S8ESS7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const firestore = firebase.firestore();

export {
    firebase,
    firestore
};

export default firestore