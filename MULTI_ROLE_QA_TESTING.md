# Multi-Role End-to-End QA Testing Guide

## Overview
This guide provides a disciplined testing strategy for validating real-time interactions between all three roles: **Employee**, **Admin**, and **Driver**.

## Setup: Three Browser Windows

### Window Configuration
1. **Window 1: Employee** (Left side)
   - URL: `http://localhost:8080/index.html#guest/employee`
   - Role: Employee Dashboard
   - Purpose: Submit booking requests

2. **Window 2: Admin** (Center)
   - URL: `http://localhost:8080/index.html#guest/admin`
   - Role: Admin Dashboard
   - Purpose: Approve/deny bookings

3. **Window 3: Driver** (Right side)
   - URL: `http://localhost:8080/index.html#guest/driver`
   - Role: Driver Dashboard
   - Purpose: Receive assignments and update status

### Developer Tools Setup
- Open Developer Tools (F12) in **ALL THREE WINDOWS**
- Enable **Console** tab in each
- Enable **Network** tab in each
- Check **"Preserve log"** in Console tab
- Arrange windows side-by-side for easy monitoring

---

## Test Scenario 1: Complete Booking Flow (Happy Path)

### 🟦 **Window 1: Employee - Submit Booking**

#### Step 1: Navigate to New Booking
- [ ] Click "New Booking Request" or navigate to `#new-booking`
- [ ] Verify form loads correctly
- [ ] **Console Check**: No red errors

#### Step 2: Fill Out Booking Form
- [ ] **Trip Purpose**: Enter "Field Trip to Science Museum"
- [ ] **Vehicle Type**: Select "Bus" (Minibus)
- [ ] **Start Date**: Select a future date (e.g., tomorrow)
- [ ] **Duration**: Select "4 hours"
- [ ] **Pickup Time**: Select "9:00 AM"
- [ ] **Driver Option**: Select "Request a School Driver"
- [ ] **Pickup Location**: Enter "Main School Entrance"
- [ ] **Passengers**: Enter "30"
- [ ] **Additional Notes**: (Optional) Enter any notes

#### Step 3: Verify Availability Check
- [ ] **Console Check**: Should see availability check logs
- [ ] Date should be enabled (not grayed out) if available
- [ ] Availability status should show green confirmation
- [ ] Submit button should be enabled

#### Step 4: Submit Booking
- [ ] Click "Submit Request"
- [ ] **Console Check (Window 1)**:
  ```
  ✅ Booking successfully saved to Firebase: [docId]
  New booking created: [bookingId] [bookingData]
  ```
- [ ] **Network Check (Window 1)**:
  - Look for `POST https://firestore.googleapis.com/v1/projects/...`
  - Status: `200 OK`
  - Check Payload: `durationHours` should be `4` (number, not string)
  - Check Payload: `requesterId` should match employee UID
- [ ] **Success Modal**: Should appear with scrollable message
- [ ] **Auto-Navigation**: Should redirect to Employee Dashboard

#### Step 5: Verify Booking in Employee Dashboard
- [ ] **Console Check**: Should see booking in dashboard refresh logs
- [ ] Booking should appear in "My Bookings" list
- [ ] Status should show "Pending" (yellow/orange pill)
- [ ] **Wait Time**: Should show "Waiting X minutes/hours"

#### ✅ **Employee Window Verification Checklist**
- [ ] Booking submitted successfully
- [ ] Console shows success message
- [ ] Network shows 200 OK
- [ ] Booking appears in dashboard with PENDING status
- [ ] No console errors

---

### 🟩 **Window 2: Admin - Approve Booking**

#### Step 1: Check Booking Queue
- [ ] Navigate to Admin Dashboard
- [ ] Go to "Booking Approvals" view
- [ ] **Console Check**: Should see pending bookings listener setup
- [ ] **Network Check**: Should see Firestore query for pending bookings

#### Step 2: Verify New Booking Appears
- [ ] **Real-Time Check**: New booking should appear automatically (if using Firebase listeners)
- [ ] OR refresh the page manually
- [ ] Booking should show:
  - Requester: Employee name
  - Purpose: "Field Trip to Science Museum"
  - Date/Time: Tomorrow at 9:00 AM
  - Vehicle: Minibus
  - Status: PENDING (yellow badge)
  - **URGENT Badge**: If booking is within 48 hours

#### Step 3: View Booking Details
- [ ] Click "View Details" on the new booking
- [ ] **Detail Modal Should Show**:
  - Request Details (Date, Time, Duration, Vehicle, Passengers)
  - Requester Context (Department, Total Bookings, Cancellation Rate)
  - Availability Timeline (Conflicting bookings if any)
  - Compliance Flags (if any violations)

#### Step 4: Approve Booking
- [ ] Click "Approve" button (or Quick Approve)
- [ ] **Console Check (Window 2)**:
  ```
  Booking approved: [bookingId]
  ```
- [ ] **Network Check (Window 2)**:
  - Look for `PATCH https://firestore.googleapis.com/v1/projects/...`
  - Status: `200 OK`
  - Check Payload: `status` should be `"APPROVED"`
  - Check Payload: `assignedDriverId` should be set (if auto-assigned)

#### Step 5: Verify Booking Status Updated
- [ ] Booking should disappear from PENDING queue
- [ ] OR status should change to "APPROVED" (green badge)
- [ ] **Console Check**: Should see real-time listener update

#### ✅ **Admin Window Verification Checklist**
- [ ] New booking appears in queue
- [ ] Booking details are correct
- [ ] Approval successful (200 OK)
- [ ] Status updated to APPROVED
- [ ] No console errors

---

### 🟨 **Window 3: Driver - Receive Assignment**

#### Step 1: Check Assigned Trips
- [ ] Navigate to Driver Dashboard
- [ ] Go to "My Trips" or "Assigned Trips" view
- [ ] **Console Check**: Should see driver trips listener setup
- [ ] **Network Check**: Should see Firestore query for assigned trips

#### Step 2: Verify Assigned Trip Appears
- [ ] **Real-Time Check**: New assigned trip should appear automatically
- [ ] OR refresh the page manually
- [ ] Trip should show:
  - Purpose: "Field Trip to Science Museum"
  - Date/Time: Tomorrow at 9:00 AM
  - Vehicle: Minibus
  - Status: APPROVED or ACTIVE
  - Passengers: 30

#### Step 3: View Trip Details
- [ ] Click on the trip card or "View Details"
- [ ] **Trip Details Should Show**:
  - Full trip information
  - Pickup location: "Main School Entrance"
  - Pickup time: 9:00 AM
  - Duration: 4 hours

#### Step 4: Start Trip Status Updates
- [ ] Click "Start Trip" button
- [ ] **Console Check (Window 3)**:
  ```
  Trip status updated: start-trip
  ```
- [ ] **Network Check (Window 3)**:
  - Look for `PATCH https://firestore.googleapis.com/v1/projects/...`
  - Status: `200 OK`
  - Check Payload: `driverStatus` should be updated
- [ ] **Button State**: "Arrived at Pickup" should become enabled

#### Step 5: Continue Status Updates
- [ ] Click "Arrived at Pickup" (now enabled)
- [ ] **Safety Checklist**: Should appear (now enabled)
- [ ] Complete all safety checks:
  - [ ] Tires checked
  - [ ] Lights functional
  - [ ] Brakes tested
  - [ ] Fuel level adequate
  - [ ] Mirrors adjusted
  - [ ] First aid kit present
- [ ] Check "All Safety Checks Confirmed"
- [ ] **Button State**: "Start Driving" should become enabled

#### Step 6: Complete Trip Workflow
- [ ] Click "Start Driving"
- [ ] **Console Check**: Status updated
- [ ] **Network Check**: 200 OK
- [ ] Click "Arrived at Destination"
- [ ] Click "Trip Complete"
- [ ] **Trip Finalization Form**: Should open

#### Step 7: Submit Final Log
- [ ] Fill out final log:
  - [ ] Final Odometer Reading: Enter number (e.g., 12500)
  - [ ] Final Fuel Level: Select from dropdown (e.g., "3/4")
  - [ ] Vehicle Issues/Comments: Enter text (e.g., "No issues")
- [ ] Click "Submit Log and Complete"
- [ ] **Console Check**: Final log submitted
- [ ] **Network Check**: 200 OK
- [ ] Trip status should change to COMPLETED

#### ✅ **Driver Window Verification Checklist**
- [ ] Assigned trip appears in real-time
- [ ] Status updates work correctly
- [ ] Safety checklist is mandatory
- [ ] Final log is mandatory
- [ ] Trip completes successfully
- [ ] No console errors

---

### 🔄 **Cross-Window Real-Time Verification**

#### Window 1 (Employee) - After Approval
- [ ] **Refresh Employee Dashboard** or wait for real-time update
- [ ] Booking status should change from PENDING to APPROVED (green pill)
- [ ] Driver name should appear (if displayed)
- [ ] **Console Check**: Should see real-time listener update

#### Window 2 (Admin) - After Driver Updates
- [ ] **Refresh Admin Dashboard** or wait for real-time update
- [ ] Booking status should show driver updates
- [ ] Active trips should show current driver status

#### Window 3 (Driver) - After Completion
- [ ] Trip should move to "Completed Trips" section
- [ ] Final log should be visible
- [ ] **Console Check**: Should see real-time listener update

---

## Test Scenario 2: Booking Denial Flow

### 🟦 **Window 1: Employee - Submit Booking**
- [ ] Submit a booking (same as Scenario 1)

### 🟩 **Window 2: Admin - Deny Booking**

#### Step 1: View Booking
- [ ] Navigate to pending bookings
- [ ] Click "View Details" on the booking

#### Step 2: Deny Booking
- [ ] Click "Deny" or "Quick Deny"
- [ ] **Templated Denial Modal**: Should appear
- [ ] Select denial reason (e.g., "Vehicle unavailable")
- [ ] Add custom notes (optional)
- [ ] Click "Confirm Denial"

#### Step 3: Verify Denial
- [ ] **Console Check**: Booking denied message
- [ ] **Network Check**: 200 OK
- [ ] Booking status should be DENIED
- [ ] Admin notes should contain denial reason

### 🟦 **Window 1: Employee - Verify Denial**
- [ ] **Refresh Employee Dashboard**
- [ ] Booking status should show DENIED (red pill)
- [ ] Admin notes should be visible
- [ ] Denial reason should be displayed

---

## Test Scenario 3: Booking Cancellation Flow

### 🟦 **Window 1: Employee - Cancel Booking**

#### Step 1: View Pending Booking
- [ ] Navigate to "My Bookings"
- [ ] Find a PENDING booking

#### Step 2: Cancel Booking
- [ ] Click "Cancel Request" button
- [ ] Confirm cancellation
- [ ] **Console Check**: Booking cancelled
- [ ] **Network Check**: 200 OK (DELETE request)

#### Step 3: Verify Cancellation
- [ ] Booking should disappear from dashboard
- [ ] OR status should change to CANCELLED

### 🟩 **Window 2: Admin - Verify Cancellation**
- [ ] **Refresh Admin Dashboard**
- [ ] Cancelled booking should no longer appear in pending queue
- [ ] OR should show CANCELLED status

---

## Test Scenario 4: Driver Delay Notification

### 🟨 **Window 3: Driver - Send Delay**

#### Step 1: Active Trip
- [ ] Have an active trip assigned
- [ ] Navigate to "My Active Trip" view

#### Step 2: Send Delay Notification
- [ ] Click "⏱️ Running 10 Mins Late" button
- [ ] **Console Check**: Delay notification sent
- [ ] **Network Check**: 200 OK (notification created)

### 🟦 **Window 1: Employee - Receive Delay**
- [ ] **Refresh Employee Dashboard**
- [ ] Delay notification should appear
- [ ] OR booking should show delay status

### 🟩 **Window 2: Admin - Monitor Delay**
- [ ] **Refresh Admin Dashboard**
- [ ] Delay notification should appear in admin view
- [ ] Active trip should show delay status

---

## Test Scenario 5: Mobile UX Testing

### Setup
1. Open Developer Tools in all three windows
2. Enable **Device Toolbar** (Cmd+Shift+M)
3. Select **iPhone 12 Pro** (390 × 844) or **Pixel 5** (393 × 851)

### Mobile Testing Checklist

#### Window 1 (Employee - Mobile)
- [ ] Form fields are readable (no zooming required)
- [ ] Date picker works on mobile
- [ ] Duration dropdown scrolls smoothly
- [ ] Submit button is large and accessible
- [ ] Success modal is scrollable
- [ ] No horizontal scrolling

#### Window 2 (Admin - Mobile)
- [ ] Booking queue is scrollable
- [ ] Quick action buttons are large enough
- [ ] Detail modal is scrollable
- [ ] No horizontal scrolling

#### Window 3 (Driver - Mobile)
- [ ] **Start Trip button**: 72px height, easy to tap
- [ ] **Status buttons**: 64px height, full-width
- [ ] **Safety checklist**: Checkboxes are large enough
- [ ] **Delay button**: Large and visible
- [ ] **Dark mode**: High contrast, readable
- [ ] No horizontal scrolling
- [ ] No accidental taps

---

## Error Scenarios to Test

### Error 1: Permission Denied (403)
**Setup**: Submit booking with incorrect `requesterId`

**Expected Behavior**:
- **Console**: `❌ Firebase Error Details: { code: 'permission-denied' }`
- **Network**: `403 Forbidden`
- **Alert**: "Permission Denied: You do not have permission..."

**Verify**: Security rules are working correctly

### Error 2: Invalid Data Type
**Setup**: Submit booking with `durationHours` as string

**Expected Behavior**:
- **Console**: `⚠️ INVALID ARGUMENT: Check data types`
- **Network**: `400 Bad Request`
- **Alert**: "Invalid duration. Please select a valid duration."

**Verify**: Data type validation is working

### Error 3: Unauthenticated
**Setup**: Submit booking without authentication

**Expected Behavior**:
- **Console**: `🔐 UNAUTHENTICATED: User is not logged in`
- **Network**: `401 Unauthorized`
- **Alert**: "Authentication Error: You are not logged in..."

**Verify**: Authentication check is working

---

## Console Monitoring Checklist

### Window 1 (Employee) - Expected Console Logs
```
✅ Booking successfully saved to Firebase: [docId]
New booking created: [bookingId] [bookingData]
startDataListeners: Employee listener set up for userId: [uid]
First refresh - Refreshing dashboard after booking submission
```

### Window 2 (Admin) - Expected Console Logs
```
startDataListeners: Admin listener set up (all pending bookings)
Booking approved: [bookingId]
```

### Window 3 (Driver) - Expected Console Logs
```
startDataListeners: Driver listener set up for userId: [uid]
Trip status updated: start-trip
Trip status updated: arrived-pickup
Trip status updated: start-driving
Final log submitted: [bookingId]
```

---

## Network Monitoring Checklist

### Window 1 (Employee) - Expected Network Requests
- `POST /v1/projects/[project]/databases/(default)/documents/all_requests`
  - Status: `200 OK`
  - Payload: `durationHours: 4` (number), `requesterId: [uid]`

### Window 2 (Admin) - Expected Network Requests
- `GET /v1/projects/[project]/databases/(default)/documents/all_requests`
  - Status: `200 OK`
  - Query: `status == 'PENDING'`
- `PATCH /v1/projects/[project]/databases/(default)/documents/all_requests/[id]`
  - Status: `200 OK`
  - Payload: `status: "APPROVED"`

### Window 3 (Driver) - Expected Network Requests
- `GET /v1/projects/[project]/databases/(default)/documents/all_requests`
  - Status: `200 OK`
  - Query: `assignedDriverId == [uid]`
- `PATCH /v1/projects/[project]/databases/(default)/documents/all_requests/[id]`
  - Status: `200 OK`
  - Payload: `driverStatus: "En Route"`, `finalLog: {...}`

---

## Real-Time Listener Verification

### Test Real-Time Updates
1. **Window 1**: Submit booking
2. **Window 2**: Should see booking appear automatically (no refresh needed)
3. **Window 2**: Approve booking
4. **Window 1**: Should see status change automatically
5. **Window 3**: Should see assigned trip appear automatically

### Expected Console Logs for Listeners
```
startDataListeners: Employee listener set up for userId: [uid]
startDataListeners: Admin listener set up (all pending bookings)
startDataListeners: Driver listener set up for userId: [uid]
```

### Listener Error Handling
If listeners fail, check console for:
```
❌ Employee bookings listener error: [error]
🔒 PERMISSION DENIED: Employee cannot read bookings
   Check Firebase Security Rules - Employee should be able to read where requesterId == auth.uid
```

---

## Success Criteria

### ✅ All Scenarios Pass If:
1. **No Console Errors**: All three windows show no red errors
2. **Network Success**: All requests return `200 OK`
3. **Real-Time Updates**: Changes appear automatically across windows
4. **Data Integrity**: All data types are correct (numbers, not strings)
5. **Mobile UX**: All touch targets are accessible, no horizontal scrolling
6. **Security**: Permission denied errors are caught and handled gracefully

### ❌ Fail If:
1. **Console Errors**: Any red errors in any window
2. **Network Failures**: Any `403 Forbidden`, `401 Unauthorized`, or `400 Bad Request`
3. **No Real-Time Updates**: Changes require manual refresh
4. **Data Type Issues**: `durationHours` or `passengers` saved as strings
5. **Mobile Issues**: Horizontal scrolling, small touch targets, or unreadable text

---

## Troubleshooting Guide

### Issue: Booking doesn't appear in Admin window
**Check**:
- [ ] Console in Window 2: Are there listener errors?
- [ ] Network in Window 2: Is the query returning data?
- [ ] Firebase Security Rules: Can admin read all bookings?

### Issue: Status doesn't update in real-time
**Check**:
- [ ] Console: Are listeners set up correctly?
- [ ] Network: Are listeners subscribing to Firestore?
- [ ] Firebase Security Rules: Can users read updated documents?

### Issue: Permission denied errors
**Check**:
- [ ] Console: What is the exact error code?
- [ ] Network: What is the response status code?
- [ ] Firebase Security Rules: Do rules match the operation?
- [ ] User Authentication: Is user logged in with correct role?

### Issue: Mobile touch targets too small
**Check**:
- [ ] Element Inspector: Check `min-height` of buttons (should be 64px+)
- [ ] CSS: Check `padding` (should be `py-5 px-8` or higher)
- [ ] Viewport: Check for horizontal scrolling

---

## Quick Reference: Expected Console Messages

### Success Messages
- ✅ `Booking successfully saved to Firebase: [docId]`
- ✅ `startDataListeners: Employee listener set up`
- ✅ `Booking approved: [bookingId]`
- ✅ `Trip status updated: [status]`

### Error Messages
- ❌ `Firebase Error Details: { code: 'permission-denied' }`
- 🔒 `PERMISSION DENIED: Check Firebase Security Rules`
- 🔐 `UNAUTHENTICATED: User is not logged in`
- ⚠️ `INVALID ARGUMENT: Check data types`

---

## Testing Schedule

### Daily Testing
- [ ] Test Scenario 1: Complete Booking Flow (Happy Path)
- [ ] Test Scenario 5: Mobile UX Testing

### Weekly Testing
- [ ] Test Scenario 2: Booking Denial Flow
- [ ] Test Scenario 3: Booking Cancellation Flow
- [ ] Test Scenario 4: Driver Delay Notification
- [ ] Test Error Scenarios

### Before Production Release
- [ ] All scenarios pass
- [ ] All error scenarios handled gracefully
- [ ] Mobile UX verified on actual devices
- [ ] Performance acceptable (no lag in real-time updates)

---

## Notes

- **Always test with three windows side-by-side** to see real-time interactions
- **Monitor Console and Network tabs** in all windows simultaneously
- **Test on mobile devices** (not just responsive mode) for accurate UX validation
- **Document any issues** with console logs and network requests for debugging

