# Opinion - Community Concerns Board

A Next.js application for managing community concerns with Firebase Realtime Database integration.

## Getting Started

To get started, take a look at src/app/page.tsx.

## Firebase Realtime Database Setup

### 1. Database Connection

The application uses Firebase Realtime Database for persistent data storage. The database connection is configured in `src/lib/firebase.ts`.

#### Required Configuration

Ensure your Firebase configuration includes the `databaseURL`:

```typescript
const firebaseConfig = {
  projectId: 'your-project-id',
  appId: 'your-app-id',
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  databaseURL: 'https://your-project-default-rtdb.firebaseio.com', // Required for Realtime Database
  messagingSenderId: 'your-sender-id',
};
```

**Note:** The `databaseURL` is **required** for Firebase Realtime Database to work properly. Without it, data operations will fail silently.

### 2. Database Schema

The application uses a simple flat structure in Firebase Realtime Database:

```
{
  "concerns": {
    "-UniqueKey1": {
      "title": "Concern Title",
      "description": "Detailed description of the concern",
      "authorName": "John Doe",
      "apartmentNumber": "2A",
      "upvotes": 5,
      "upvotedBy": ["2A", "3B", "4C"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "-UniqueKey2": {
      // Another concern object
    }
  }
}
```

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

### 3. Database Operations

#### Reading Data

The application uses `onValue` listener to subscribe to real-time updates:

```typescript
const concernsRef = ref(db, 'concerns');
const unsubscribe = onValue(concernsRef, (snapshot) => {
  const data = snapshot.val();
  // Process data
});
```

#### Creating a Concern

New concerns are created using `push` and `set`:

```typescript
const concernsRef = ref(db, 'concerns');
const newConcernRef = push(concernsRef); // Generates unique key
const newConcern = {
  title: "Example",
  description: "Description",
  authorName: "John",
  apartmentNumber: "2A",
  upvotes: 1,
  upvotedBy: ["2A"],
  createdAt: new Date().toISOString(),
};
set(newConcernRef, newConcern);
```

#### Updating a Concern (Upvoting)

Existing concerns are updated using `update`:

```typescript
const concernRef = ref(db, `concerns/${concernId}`);
const updates = {
  upvotes: newUpvoteCount,
  upvotedBy: updatedArray,
};
update(concernRef, updates);
```

### 4. Setting Up Firebase Realtime Database

#### Step-by-Step Guide

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Realtime Database**
   - In your Firebase project, navigate to "Build" > "Realtime Database"
   - Click "Create Database"
   - Choose a location (e.g., `us-central1`)
   - Start in **test mode** for development (set proper rules for production)

3. **Get Configuration Values**
   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" section
   - Copy the Firebase configuration values
   - The `databaseURL` should be in the format: `https://[project-id]-default-rtdb.firebaseio.com`

4. **Set Security Rules**
   
   For development (test mode):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   For production (recommended):
   ```json
   {
     "rules": {
       "concerns": {
         ".read": true,
         ".write": true,
         "$concernId": {
           ".validate": "newData.hasChildren(['title', 'description', 'authorName', 'apartmentNumber', 'upvotes', 'upvotedBy', 'createdAt'])"
         }
       }
     }
   }
   ```

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
