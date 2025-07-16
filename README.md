# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment

This application is configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). You can deploy it for free for personal use on the Firebase Spark plan.

Follow these steps to deploy your application:

1.  **Install the Firebase CLI**:
    If you don't have it installed, run the following command in your terminal:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Create a Firebase Project**:
    Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project if you don't have one already.

4.  **Link your local project to Firebase**:
    Run the following command and select the Firebase project you created.
    ```bash
    firebase use --add
    ```

5.  **Create an App Hosting backend**:
    You'll need to create a "backend" resource in your Firebase project. Choose a location close to your users.
    ```bash
    firebase apphosting:backends:create --location us-central1
    ```
    This will create a backend with the ID `nextn`.

6.  **Deploy your app**:
    Finally, build and deploy your application with this command:
    ```bash
    firebase apphosting:backends:deploy nextn
    ```

After the deployment is complete, the CLI will output the URL where your application is live. That's it!
