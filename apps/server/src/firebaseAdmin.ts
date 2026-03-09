// Import the Firebase Admin SDK
// This SDK allows server-side access to Firebase services
// such as authentication, database, and messaging (FCM)
import admin from 'firebase-admin'


// Define a TypeScript type for the Firebase service account
// This represents the credentials required to authenticate
// the server with Firebase.
type FirebaseServiceAccount = {
  projectId: string;     // Firebase project ID
  clientEmail: string;   // Service account email used for authentication
  privateKey: string;    // Private key used to sign requests securely
};


// Function to safely read Firebase credentials from environment variables
// Returns the service account object if all variables exist
// Otherwise returns null
function getServiceAccount(): FirebaseServiceAccount | null {

  // Read Firebase project ID from environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // Read service account email from environment variables
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Read private key from environment variables
  // Firebase private keys often contain newline characters
  // but environment variables store them as "\n"
  // so we convert them back into real newline characters
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");


  // If any required credential is missing
  // we cannot initialize Firebase safely
  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Return the service account credentials object
  return {
    projectId,
    clientEmail,
    privateKey,
  };
}


// Function that initializes Firebase Admin and returns
// the Firebase Cloud Messaging (FCM) service instance
export function getFirebaseMessaging(): admin.messaging.Messaging | null {

  // Fetch service account credentials
  const serviceAccount = getServiceAccount();

  // If credentials are missing, return null
  // This prevents the server from crashing
  if (!serviceAccount) return null;


  // Firebase Admin should only be initialized once
  // admin.apps stores all initialized Firebase app instances
  // If length is 0, it means Firebase has not been initialized yet
  if (!admin.apps.length) {

    // Initialize Firebase Admin with service account credentials
    admin.initializeApp({

      // admin.credential.cert() creates a credential object
      // using the provided service account information
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Return the Firebase Cloud Messaging service
  // This is used to send push notifications to devices
  return admin.messaging();
}

