# Opinion

This app lets residents submit and upvote community concerns. This repository has been updated to support:

- Firebase Authentication using FirebaseUI (phone, Google, email)
- A Profile page where users verify their details (Full Name, Tower, Apartment Number, Phone)
- Firestore rules that restrict creating/upvoting concerns to verified users

## Auth & Profile Flow

1. User signs in at `/signin` using FirebaseUI.
2. After sign-in, user is redirected to `/profile` to complete verification.
3. Saving the profile writes to `profiles/{uid}` with `verified: true`.
4. Only verified users can submit or upvote concerns.

## Firestore

- `profiles/{uid}`: stores user profile and `verified` flag.
- `concerns/{id}`: stores concerns. Publicly readable; writes gated by rules.

See `firestore.rules` for full authorization logic.

# Opinion - Community Concerns Board

A Next.js application for managing community concerns with Firebase Realtime Database integration.
# Opinion - Community Concerns Board

A Next.js application for managing community concerns with Firebase **Firestore** integration (previous Realtime Database support removed in favor of Firestore's atomic operations and richer querying).

## Getting Started

To get started, take a look at src/app/page.tsx.

## Firestore Setup

### 1. Database Connection

The application uses **Cloud Firestore** for persistent data storage. The client SDK is initialized in `src/lib/firebase.ts`. A Firestore-based React hook lives in `src/hooks/useConcernsFirestore.ts`.

#### Required Configuration

Ensure your Firebase web config (no private key) is present; Firestore does not require a `databaseURL` field. Admin (MCP server) credentials are loaded from `.env.local`.

### 2. Data Model (Firestore Collection: `concerns`)

Each document in `concerns`:
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Title of concern |
| `description` | string | Detailed description |
| `authorName` | string | Creator name |
| `apartmentNumber` | string | Apartment identifier |
| `upvotes` | number | Count of upvotes (length of `upvotedBy`) |
| `upvotedBy` | string[] | Apartment numbers that upvoted |
| `createdAt` | string (ISO) | Creation timestamp |

Document ID is used as `id` in the UI.

#### Schema Details

**Concerns Collection** (`/concerns`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated unique key (not stored in DB, derived from the key) |
| `title` | string | Title of the concern |
| `description` | string | Detailed description of the issue |
| `authorName` | string | Name of the person who created the concern |
| `apartmentNumber` | string | Apartment number of the author |
| `upvotes` | number | Total number of upvotes |
| `upvotedBy` | array | Array of apartment numbers that have upvoted |
| `createdAt` | string | ISO 8601 timestamp of when the concern was created |

### 3. Operations

The React hook (`useConcernsFirestore`) uses `onSnapshot` for real-time updates.

Creation uses `addDoc(collection(...))` and initializes `upvotes = 1`, `upvotedBy = [creatorApartment]`.

Upvotes use `updateDoc` with updated arrays (UI) while the MCP server uses atomic `arrayUnion` & `increment`.

### 4. Setting Up Firestore

#### Step-by-Step Guide

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Firestore**
  - Build > Firestore Database > Create database
  - Start in test mode (development only) OR apply the secure rules below.

3. **Get Configuration Values**
   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" section
   - Copy the Firebase configuration values
   - The `databaseURL` should be in the format: `https://[project-id]-default-rtdb.firebaseio.com`

4. **Security Rules (Hardened Example)**

Firestore rules (replace YOUR_PROJECT_ID if needed):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /concerns/{concernId} {
      allow read: if true; // Public read (adjust if you need auth)
      allow create: if request.resource.data.keys().hasAll(['title','description','authorName','apartmentNumber','upvotes','upvotedBy','createdAt'])
        && request.resource.data.upvotes == 1
        && request.resource.data.upvotedBy.size() == 1;
      allow update: if request.resource.data.keys().hasAll(['title','description','authorName','apartmentNumber','upvotes','upvotedBy','createdAt'])
        && request.resource.data.upvotes == resource.data.upvotes + 1
        && request.resource.data.upvotedBy.size() == resource.data.upvotedBy.size() + 1;
      allow delete: if false; // Disallow deletes (adjust as needed)
    }
  }
}
```

For quick local prototyping you can temporarily loosen, but revert to hardened rules before production.

5. **Initialize Database**
   - The application automatically seeds initial data if the database is empty
   - Initial concerns are defined in `src/lib/data.ts`

### 5. Troubleshooting

**Data not inserting?**
- Verify `databaseURL` is present in `firebase.ts` configuration
- Check Firebase Console > Realtime Database for any error messages
- Ensure database rules allow write access
- Check browser console for Firebase errors

**Data not loading?**
- Verify database rules allow read access
- Check network tab in browser DevTools for failed requests
- Ensure the database instance is created in Firebase Console

### 6. Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:9002`
