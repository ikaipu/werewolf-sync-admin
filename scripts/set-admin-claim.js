#!/usr/bin/env node

const admin = require("firebase-admin");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Initialize Firebase Admin
const serviceAccount = require("../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "werewolfgamejp-dev",
});

async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log("Successfully set admin claim for user:", {
      uid: user.uid,
      email: user.email,
    });

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin claim:", error);
    process.exit(1);
  }
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("email", {
    alias: "e",
    description: "Admin user email",
    type: "string",
    demandOption: true,
  })
  .help()
  .parseSync();

// Execute
setAdminClaim(argv.email);
