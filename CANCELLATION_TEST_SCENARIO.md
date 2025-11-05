# Real-Time Cancellation Test Scenario

## Test Scenario: Employee Cancels Approved Trip

### Setup
Open **three separate browser windows** side-by-side:

1. **Window 1: Employee** (`#guest/employee`)
2. **Window 2: Admin** (`#guest/admin`)
3. **Window 3: Driver** (`#guest/driver`)

Open **Developer Tools (F12)** in all three windows with **Console** and **Network** tabs visible.

---

## Step-by-Step Test

### Step 1: Employee Submits Booking (Window 1)

1. Navigate to "New Booking Request"
2. Fill out form:
   - **Trip Purpose**: "Field Trip to Science Museum"
   - **Vehicle Type**: "Bus" (Minibus)
   - **Start Date**: Tomorrow (or future date)
   - **Duration**: "4 hours"
   - **Pickup Time**: "10:00 AM"
   - **Driver Option**: "Request a School Driver"
   - **Pickup Location**: "Main School Entrance"
   - **Passengers**: "30"
3. Click "Submit Request"

**Expected Console (Window 1)**:
```
✅ Booking successfully saved to Firebase: [docId]
New booking created: [bookingId] [bookingData]
startDataListeners: Employee listener set up for userId: [uid]
```

**Expected Network (Window 1)**:
- `POST /v1/projects/.../all_requests` → Status: `200 OK`
- Payload: `durationHours: 4` (number), `status: "PENDING"`

**Verify**: Booking appears in Employee dashboard with "Pending" status

---

### Step 2: Admin Approves and Assigns Driver (Window 2)

1. Navigate to "Booking Approvals" view
2. **Verify**: New booking appears in pending queue
3. Click "Approve" on the new booking
4. **Assign Driver**: Select "Driver X" (or auto-assign if implemented)

**Expected Console (Window 2)**:
```
startDataListeners: Admin listeners set up (pending + all bookings for real-time status updates)
📊 Admin Pending Listener: [X] pending bookings
Booking approved: [bookingId]
```

**Expected Network (Window 2)**:
- `PATCH /v1/projects/.../all_requests/[id]` → Status: `200 OK`
- Payload: `status: "APPROVED"`, `assignedDriverId: "driver_x"`

**Verify**: 
- Booking status changes to "Approved" (green pill)
- Booking disappears from pending queue
- Driver is assigned

---

### Step 3: Driver Receives Assignment (Window 3)

1. Navigate to "My Trips" or "Assigned Trips" view
2. **Verify**: Assigned trip appears in "Upcoming Trips" list

**Expected Console (Window 3)**:
```
startDataListeners: Driver listener set up for userId: driver_x
🚗 Driver Listener: 1 active/approved trips found (CANCELLED trips automatically excluded)
🚗 Driver Dashboard: Found 1 active/approved trips for driver driver_x
   Note: CANCELLED trips are automatically excluded by query filter
```

**Expected Network (Window 3)**:
- `GET /v1/projects/.../all_requests` → Status: `200 OK`
- Query: `assignedDriverId == driver_x AND status IN ['APPROVED', 'ACTIVE']`

**Verify**: 
- Trip appears in driver's "Upcoming Trips"
- Trip details are correct (Purpose, Date, Time, Vehicle, Passengers)

---

### Step 4: Employee Cancels Trip (Window 1) - **CRITICAL TEST**

1. Navigate to "My Bookings" view
2. Find the approved booking
3. **Wait until 9:00 AM** (one hour before 10:00 AM pickup)
4. Click "Cancel Request" button
5. Confirm cancellation

**Expected Console (Window 1)**:
```
🔄 Cancelling booking [bookingId]... { status: 'CANCELLED', cancelledAt: '...', adminNotes: '...' }
✅ Booking [bookingId] cancelled successfully. Status updated to CANCELLED.
📡 Real-time listeners should automatically update:
   - Driver window: Trip will disappear from "Upcoming Trips"
   - Admin window: Status will change to "Cancelled"
```

**Expected Network (Window 1)**:
- `PATCH /v1/projects/.../all_requests/[id]` → Status: `200 OK`
- Payload: `status: "CANCELLED"`, `cancelledAt: "[timestamp]"`

**Verify**: 
- Employee dashboard shows booking as "Cancelled" (gray pill)
- Success message appears

---

### Step 5: Real-Time Update Verification (Window 3 - Driver)

**IMMEDIATELY CHECK** (within 1-2 seconds):

**Expected Console (Window 3)**:
```
🚗 Driver Listener: 0 active/approved trips found (CANCELLED trips automatically excluded)
   ⚠️ No active trips - Trip card should show "No Active Trips"
🚗 Driver Dashboard: 0 active trips after filtering CANCELLED
🚗 Driver Dashboard: No active trips found. Trip card should be empty or show "No active trips"
```

**Expected Network (Window 3)**:
- **No new request needed** (onSnapshot automatically updates)
- Real-time listener receives update with `status: "CANCELLED"`

**Verify**: 
- ✅ **Trip instantly disappears from "Upcoming Trips" list**
- ✅ Trip card shows "No Active Trips" or is empty
- ✅ **No manual refresh needed** (real-time update)

---

### Step 6: Real-Time Update Verification (Window 2 - Admin)

**IMMEDIATELY CHECK** (within 1-2 seconds):

**Expected Console (Window 2)**:
```
🔄 Admin All Bookings Listener: 1 cancelled booking(s) detected
   - Booking [bookingId] is CANCELLED (real-time update) - Purpose: Field Trip to Science Museum
📊 Admin Pending Listener: [X] pending bookings
```

**Expected Network (Window 2)**:
- **No new request needed** (onSnapshot automatically updates)
- Real-time listener receives update with `status: "CANCELLED"`

**Verify**: 
- ✅ **Booking status shows "Cancelled"** (gray badge)
- ✅ Booking appears in cancelled bookings list (if implemented)
- ✅ **No manual refresh needed** (real-time update)

---

## QA Checklist

### ✅ Pass Criteria

1. **Employee Window (Window 1)**:
   - [ ] Booking cancelled successfully
   - [ ] Console shows success message
   - [ ] Network shows 200 OK
   - [ ] Status updated to "Cancelled"

2. **Driver Window (Window 3)** - **CRITICAL**:
   - [ ] **Trip instantly disappears from "Upcoming Trips"** (within 1-2 seconds)
   - [ ] **No manual refresh needed**
   - [ ] Console shows "0 active trips" message
   - [ ] Trip card shows "No Active Trips" or is empty
   - [ ] Real-time listener receives update automatically

3. **Admin Window (Window 2)** - **CRITICAL**:
   - [ ] **Status shows "Cancelled"** (within 1-2 seconds)
   - [ ] **No manual refresh needed**
   - [ ] Console shows cancelled booking detected
   - [ ] Real-time listener receives update automatically

### ❌ Fail Criteria

1. **Driver Window**:
   - [ ] Trip still appears in "Upcoming Trips" after cancellation
   - [ ] Manual refresh required to see update
   - [ ] Console shows error messages
   - [ ] Real-time listener not working

2. **Admin Window**:
   - [ ] Status doesn't update to "Cancelled"
   - [ ] Manual refresh required to see update
   - [ ] Console shows error messages
   - [ ] Real-time listener not working

---

## Troubleshooting

### Issue: Trip doesn't disappear from Driver window

**Check**:
1. **Console (Window 3)**: Are there listener errors?
   ```
   ❌ Driver trips listener error: [error]
   ```
2. **Network (Window 3)**: Is the listener query correct?
   - Query should filter: `status IN ['APPROVED', 'ACTIVE']`
   - CANCELLED trips should be excluded
3. **Firebase Query**: Verify query includes:
   ```javascript
   where('status', 'in', ['APPROVED', 'ACTIVE'])
   ```
4. **populateDriverDashboard**: Check if it filters CANCELLED:
   ```javascript
   .filter(booking => booking.status !== 'CANCELLED')
   ```

### Issue: Admin window doesn't show "Cancelled" status

**Check**:
1. **Console (Window 2)**: Does "Admin All Bookings Listener" show cancelled bookings?
   ```
   🔄 Admin All Bookings Listener: 1 cancelled booking(s) detected
   ```
2. **Network (Window 2)**: Is the listener query working?
   - Should listen to all bookings (not just PENDING)
3. **populateAdminDashboard**: Check if it shows CANCELLED status

### Issue: Real-time updates not working

**Check**:
1. **Console (All Windows)**: Are listeners set up?
   ```
   startDataListeners: [Role] listener set up
   ```
2. **Network (All Windows)**: Are there WebSocket connections?
   - Look for persistent connections to Firestore
3. **Firebase Security Rules**: Can roles read all bookings?
   - Admin: Should have full read/write access
   - Driver: Should read where `assignedDriverId == auth.uid`

---

## Expected Timeline

| Time | Action | Window 1 (Employee) | Window 2 (Admin) | Window 3 (Driver) |
|------|--------|---------------------|------------------|-------------------|
| T+0 | Employee submits booking | Status: PENDING | Appears in queue | N/A |
| T+1 | Admin approves | Status: APPROVED | Status: APPROVED | Appears in "Upcoming Trips" |
| T+2 | Employee cancels (9:00 AM) | Status: CANCELLED | **Status: CANCELLED** (real-time) | **Trip disappears** (real-time) |

**Critical**: Updates in Windows 2 and 3 should happen **within 1-2 seconds** without manual refresh.

---

## Success Indicators

✅ **Test Passes If**:
1. Trip disappears from Driver's "Upcoming Trips" **instantly** (no refresh)
2. Admin window shows "Cancelled" status **instantly** (no refresh)
3. Console logs show real-time listener updates
4. No errors in any window

❌ **Test Fails If**:
1. Trip remains in Driver's list after cancellation
2. Admin window requires manual refresh to see "Cancelled"
3. Console shows listener errors
4. Real-time updates don't work

---

## Notes

- **Real-time updates rely on Firebase `onSnapshot` listeners**
- **Driver listener filters**: `status IN ['APPROVED', 'ACTIVE']` (excludes CANCELLED)
- **Admin listener**: Listens to all bookings to detect CANCELLED status
- **No manual refresh should be needed** - updates should be instant

