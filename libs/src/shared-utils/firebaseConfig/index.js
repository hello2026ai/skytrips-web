import { initializeApp } from "firebase/app"
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "skytrips-au.firebaseapp.com",
  projectId: "skytrips-au",
  storageBucket: "skytrips-au.appspot.com",
  messagingSenderId: "102130325519",
  appId: "1:102130325519:web:5a5a85f275c90702a6ab7a",
  measurementId: "G-NWQCX9XHTM"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
let remoteConfig
if (typeof window !== "undefined") {
  const { getRemoteConfig } = require("firebase/remote-config")
  remoteConfig = getRemoteConfig(app)

  remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000 // 1 hour
  }
  fetchAndActivate(remoteConfig)
    .then(() => {
    })
    .catch((err) => {
      console.error("Remote config activation failed:", err)
    })
}

export { app, remoteConfig }
