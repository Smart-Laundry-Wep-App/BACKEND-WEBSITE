import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";
import { config } from "./config.js";

export const gemini = config.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: config.GEMINI_API_KEY })
  : null;

if (config.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}

export async function pushToDevice(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<string> {
  if (!admin.apps.length) {
    throw new Error("Firebase Cloud Messaging belum dikonfigurasi");
  }
  return admin.messaging().send({
    token,
    notification: { title, body },
    data,
  });
}
