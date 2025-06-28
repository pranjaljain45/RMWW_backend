const admin = require("firebase-admin");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


module.exports = admin;



