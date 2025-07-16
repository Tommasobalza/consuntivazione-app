# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment

### Firebase App Hosting (Opzione 1)

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

---

### Altre Opzioni di Deployment Gratuito

Se riscontri problemi o preferisci altre piattaforme, ecco due alternative eccellenti per pubblicare la tua applicazione Next.js gratuitamente.

#### Vercel (Consigliato)

Vercel è la piattaforma creata dagli stessi sviluppatori di Next.js, quindi l'integrazione è perfetta. Il loro piano "Hobby" è gratuito e ideale per progetti personali.

1.  **Crea un repository Git**: Se non l'hai già fatto, carica il tuo codice su un repository GitHub, GitLab o Bitbucket.
2.  **Registrati su Vercel**: Vai su [vercel.com](https://vercel.com/) e registrati con il tuo account Git.
3.  **Importa il Progetto**: Dalla dashboard di Vercel, clicca su "Add New... > Project" e seleziona il repository che hai appena creato.
4.  **Configura e Pubblica**: Vercel riconoscerà automaticamente che si tratta di un'app Next.js e imposterà tutto per te. Clicca su "Deploy".

In pochi minuti, la tua app sarà online. Ad ogni `git push` sul tuo repository, Vercel creerà automaticamente una nuova versione.

#### Netlify

Netlify è un'altra ottima piattaforma con un supporto eccellente per Next.js e un generoso piano gratuito.

1.  **Crea un repository Git**: Assicurati che il tuo codice sia su GitHub, GitLab o Bitbucket.
2.  **Registrati su Netlify**: Vai su [app.netlify.com](https://app.netlify.com/) e registrati con il tuo account Git.
3.  **Aggiungi un nuovo sito**: Dalla dashboard, clicca su "Add new site > Import an existing project" e scegli il tuo repository.
4.  **Configura le impostazioni**: Netlify rileverà che è un progetto Next.js. Le impostazioni predefinite dovrebbero funzionare correttamente.
5.  **Pubblica il sito**: Clicca su "Deploy site".

Come per Vercel, Netlify pubblicherà automaticamente ogni modifica che carichi sul tuo repository Git.
