# Firebase Setup Guide for SmartCarBooking

## Overview

This guide will help you set up Firebase for the SmartCarBooking application. The application now supports both Firebase Firestore (production) and mock data (development).

## Files Created

1. **`firestore.rules`** - Security rules for Firestore
2. **`firebase.json`** - Firebase project configuration
3. **`firestore.indexes.json`** - Firestore indexes for query optimization

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "smartcarbooking")
4. Follow the setup wizard

### 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Start in **production mode** (we'll configure security rules)
4. Choose a location for your database

### 3. Configure Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get Started"
3. Enable "Email/Password" authentication
4. (Optional) Enable other providers as needed

### 4. Set Up Custom Claims for User Roles

Custom claims are required for role-based access control. You'll need to set these using Firebase Admin SDK or Cloud Functions.

**Example Cloud Function to set custom claims:**

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verify user is admin
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }
  
  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });
  return { success: true };
});
```

**Or manually set in Firestore users collection:**

Create a `users/{userId}` document with:
```json
{
  "role": "employee",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 5. Update Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Copy the Firebase configuration

5. Open `index.html` and replace the Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Deploy Security Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Security Rules Explanation

### Employee Permissions

**Can CREATE booking requests:**
- ✅ Must be authenticated
- ✅ Must have role: 'employee'
- ✅ `requesterId` must match authenticated user's UID
- ✅ Status must be 'PENDING' (cannot create as approved/denied)

**Can UPDATE booking requests:**
- ✅ Must be authenticated
- ✅ Must have role: 'employee'
- ✅ Must be the requester of the booking
- ✅ Booking must be 'PENDING' status
- ✅ Cannot change `requesterId`

**Can DELETE booking requests:**
- ✅ Must be authenticated
- ✅ Must have role: 'employee'
- ✅ Must be the requester of the booking
- ✅ Booking must be 'PENDING' or 'APPROVED' status

**Can READ booking requests:**
- ✅ Must be authenticated
- ✅ Must have role: 'employee'
- ✅ Must be the requester of the booking

### Admin Permissions

- ✅ Full read/write access to all requests
- ✅ Can manage vehicles collection
- ✅ Can manage users collection

### Driver Permissions

- ✅ Can read requests assigned to them
- ✅ Can read approved requests (for assignment)
- ✅ Can update their assigned trips (status, final log)

## Testing Security Rules

### Test Employee Write Permission

**Question:** Does an authenticated user with role: 'employee' have permission to write to the `all_requests` collection?

**Answer:** YES, with restrictions:

1. **CREATE**: ✅ Yes - Employees can create their own booking requests
   - Must be authenticated
   - `requesterId` must match their UID
   - Status must be 'PENDING'

2. **UPDATE**: ✅ Yes - Employees can update their own pending requests
   - Must be the requester
   - Booking must be 'PENDING'
   - Cannot change `requesterId`

3. **DELETE**: ✅ Yes - Employees can delete their own pending/approved requests
   - Must be the requester
   - Status must be 'PENDING' or 'APPROVED'

**Why?** Employees need to:
- Submit booking requests
- Modify pending requests before admin approval
- Cancel their own bookings

### Test Admin Access

Admins have full access to all requests for management and approval purposes.

### Test Driver Access

Drivers can only read and update requests assigned to them.

## Data Structure

### Booking Document Structure

```javascript
{
  requesterId: "user_uid",           // Employee's UID
  vehicleType: "Minibus",            // Vehicle type
  startTime: "2025-11-06T08:00:00Z", // ISO timestamp
  durationHours: 4,                   // Duration in hours
  driverOption: "Request Driver",     // or "Self-Drive"
  status: "PENDING",                 // PENDING, APPROVED, DENIED, ACTIVE, COMPLETED
  adminNotes: "",                     // Admin's denial reason
  passengers: 30,                     // Number of passengers
  tripPurpose: "Field Trip",          // Trip purpose
  pickupLocation: "Main Gate",        // Optional
  notes: "Special requirements",      // Optional
  submittedTime: "2025-11-05T10:00:00Z", // Submission timestamp
  assignedDriverId: "driver_uid",     // Optional - set by admin
  driverStatus: "En Route",           // Optional - updated by driver
  finalLog: {                         // Optional - completed trips
    odometerEnd: 12150,
    fuelLevelEnd: "3/4",
    issuesComments: "No issues"
  }
}
```

## Development vs Production

### Development Mode (Mock Data)

- Works without Firebase configuration
- Uses in-memory `MOCK_BOOKINGS`, `MOCK_USERS`, `MOCK_VEHICLES`
- No authentication required
- Perfect for development and testing

### Production Mode (Firestore)

- Requires Firebase configuration
- Uses Firestore database
- Requires authentication
- Enforces security rules
- Real-time updates available

The application automatically detects if Firebase is configured and switches between modes.

## Troubleshooting

### "Permission Denied" Errors

1. Check user is authenticated: `firebaseAuth.currentUser`
2. Check user has correct role in custom claims
3. Verify security rules match your data structure
4. Check Firestore indexes are created

### "Index Not Found" Errors

1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait for indexes to build (can take a few minutes)
3. Check Firebase Console > Firestore > Indexes

### Configuration Not Working

1. Verify Firebase config in `index.html`
2. Check browser console for errors
3. Ensure Firebase SDK is loaded
4. Check network tab for API calls

## Next Steps

1. Set up Firebase project
2. Configure authentication
3. Set custom claims for users
4. Deploy security rules
5. Test with real users
6. Monitor Firebase Console for errors

## Support

For issues or questions:
- Check Firebase Console logs
- Review security rules in Firestore Console
- Test rules in Firebase Console > Firestore > Rules > Rules Playground

