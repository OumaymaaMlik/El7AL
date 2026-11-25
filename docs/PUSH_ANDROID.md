# Android push notifications (Firebase)

The server already sends the pushes (new request, accepted, artisan close, chat, transfers) through Expo. On Android,
Expo delivers them through Firebase Cloud Messaging (FCM), so the app needs two things from a Firebase project.
Until both are done, **an Android phone receives no push**.

## 1. Create the Firebase project

1. Open https://console.firebase.google.com and create a project (for example "El 7al"). Google Analytics is not needed.
2. Add an **Android app** with the package name `tn.el7al.connect` (exactly this).
3. Download **google-services.json** and put it in `apps/mobile/` (next to `app.json`).

`app.config.js` picks the file up by itself. The file identifies the app; it is not a password, and it can be
committed. EAS does not upload files that git ignores.

## 2. Give Expo the right to send (FCM V1 key)

1. In Firebase: **Project settings → Service accounts → Generate new private key**. A JSON file downloads.
2. This one **is a secret**. Keep it outside the project folder and never commit it.
3. In a terminal, in `apps/mobile`:

   ```
   npx eas-cli credentials -p android
   ```

   Choose **production**, then **Google Service Account**, then **Manage your Google Service Account Key for Push
   Notifications (FCM V1)**, then upload the JSON file from step 1.

## 3. Build and test

1. `npx eas-cli build -p android --profile production`, then install the new build (through Play internal testing).
2. Sign in as an artisan and allow notifications. This saves the phone's push address on the account.
3. Close the app completely, then send a request from a client. The phone should ring within a few seconds.

If nothing arrives: check that notifications are allowed for the app in the phone's settings, that the artisan is
online, and look at the server log for `Push notification failed`.

Test a real phone, not an emulator, and not Expo Go: Expo Go on Android does not receive push notifications.
