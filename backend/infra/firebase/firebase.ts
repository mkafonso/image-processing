import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  Buffer.from(
    String(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64),
    "base64"
  ).toString("utf-8")
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const firestore = getFirestore();
firestore.settings({ ignoreUndefinedProperties: true });
