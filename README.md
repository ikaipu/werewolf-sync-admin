# Werewolf Sync Admin

## Admin User Setup

To create an admin user, follow these steps:

1. Get the service account key:
   - Go to Firebase Console > Project Settings > Service accounts
   - Click "Generate New Private Key"
   - Save the downloaded file as `service-account.json` in the project root

2. Run the create admin script:
```bash
yarn create-admin --email your-email@example.com --password your-password
```

Example:
```bash
yarn create-admin -e kabikabitznz@gmail.com -p Werewolf-admin