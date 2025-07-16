# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deployment

Una volta che il tuo codice è pronto, puoi pubblicarlo online gratuitamente. Il primo passo è caricarlo su GitHub.

### 1. Caricare il Codice su GitHub

Se non hai mai usato Git o GitHub, segui questi passaggi dal terminale nella cartella del tuo progetto.

1.  **Crea un repository su GitHub**:
    *   Vai su [github.com/new](https://github.com/new).
    *   Assegna un nome al repository (es. `consuntivazione-app`).
    *   Assicurati che sia "Public" o "Private" a tua scelta.
    *   **Non** inizializzarlo con un `README` o `.gitignore`, li abbiamo già.
    *   Clicca su "Create repository".

2.  **Inizializza Git nel tuo progetto**:
    ```bash
    git init
    ```

3.  **Aggiungi e salva i file**:
    ```bash
    git add .
    git commit -m "Primo commit: versione iniziale dell'app"
    ```

4.  **Collega il repository locale a GitHub**:
    Sostituisci l'URL con quello fornito da GitHub per il tuo repository.
    ```bash
    git remote add origin https://github.com/Tommasobalza/consuntivazione-app.git
    ```

5.  **Carica il codice**:
    ```bash
    git branch -M main
    git push -u origin main
    ```

Ora il tuo codice è su GitHub! Da qui, puoi scegliere una delle seguenti piattaforme per la pubblicazione.

---

### 2. Scegli una Piattaforma di Deployment

#### Vercel (Consigliato)

Vercel è la piattaforma creata dagli stessi sviluppatori di Next.js, quindi l'integrazione è perfetta. Il loro piano "Hobby" è gratuito e ideale per progetti personali.

1.  **Registrati su Vercel**: Vai su [vercel.com](https://vercel.com/) e registrati con il tuo account GitHub.
2.  **Importa il Progetto**: Dalla dashboard di Vercel, clicca su "Add New... > Project" e seleziona il repository che hai appena creato su GitHub.
3.  **Configura e Pubblica**: Vercel riconoscerà automaticamente che si tratta di un'app Next.js e imposterà tutto per te. Clicca su "Deploy".

In pochi minuti, la tua app sarà online. Ad ogni `git push` sul tuo repository, Vercel creerà automaticamente una nuova versione.

#### Netlify

Netlify è un'altra ottima piattaforma con un supporto eccellente per Next.js e un generoso piano gratuito.

1.  **Registrati su Netlify**: Vai su [app.netlify.com](https://app.netlify.com/) e registrati con il tuo account GitHub.
2.  **Aggiungi un nuovo sito**: Dalla dashboard, clicca su "Add new site > Import an existing project" e scegli il tuo repository GitHub.
3.  **Configura le impostazioni**: Netlify rileverà che è un progetto Next.js. Le impostazioni predefinite dovrebbero funzionare correttamente.
4.  **Pubblica il sito**: Clicca su "Deploy site".

Come per Vercel, Netlify pubblicherà automaticamente ogni modifica che carichi sul tuo repository Git.

#### Firebase App Hosting

Questa applicazione è anche configurata per [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

1.  **Installa la Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login a Firebase**:
    ```bash
    firebase login
    ```
3.  **Crea un progetto Firebase**: Vai alla [Firebase Console](https://console.firebase.google.com/) se non ne hai uno.
4.  **Collega il progetto locale a Firebase**:
    ```bash
    firebase use --add
    ```
5.  **Crea un backend App Hosting**:
    ```bash
    firebase apphosting:backends:create --location us-central1
    ```
6.  **Esegui il deploy**:
    ```bash
    firebase apphosting:backends:deploy nextn
    ```

    