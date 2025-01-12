const admin = require('firebase-admin');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Initialize Firebase Admin
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "werewolfgamejp-dev"
});

async function createAdminUser(email: string, password: string) {
  try {
    // Create user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true
    });

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    console.log('Successfully created admin user:', {
      uid: userRecord.uid,
      email: userRecord.email
    });

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    description: 'Admin user email',
    type: 'string',
    demandOption: true
  })
  .option('password', {
    alias: 'p',
    description: 'Admin user password',
    type: 'string',
    demandOption: true
  })
  .help()
  .parseSync();

// Execute
createAdminUser(argv.email, argv.password);