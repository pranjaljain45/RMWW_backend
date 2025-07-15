const admin = require("firebase-admin");

// Replace this with your actual Firebase Admin SDK service account JSON object
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
