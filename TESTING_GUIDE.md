# Testing Guide: Console, Network, and Mobile UX

## A. Console & Network Tab Testing (Primary Debugging View)

### Console Tab Setup
1. Open Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Enable **"Preserve log"** checkbox (to keep logs after page navigation)
4. Clear console before testing

### What to Look For

#### ✅ Success Indicators
- `✅ Booking successfully saved to Firebase: [docId]`
- `startDataListeners: Employee listener set up for userId: [uid]`
- `New booking created: [bookingId] [bookingData]`
- No red errors

#### ❌ Critical Errors to Watch For

**1. Firebase Permission Denied (403)**
```
❌ Firebase Error Details: { code: 'permission-denied', ... }
🔒 PERMISSION DENIED: Check Firebase Security Rules
```
- **Network Tab Check**: Look for `POST https://firestore.googleapis.com/v1/projects/...` with status `403 Forbidden`
- **Action**: Verify Firebase Security Rules allow employee writes with correct `requesterId`
- **Verify**: Check that `bookingData.requesterId === user.uid` in console logs

**2. Unauthenticated Error**
```
❌ Firebase Error Details: { code: 'unauthenticated', ... }
🔐 UNAUTHENTICATED: User is not logged in
```
- **Network Tab Check**: Look for `401 Unauthorized` responses
- **Action**: Ensure user is authenticated before booking submission

**3. Invalid Argument Error**
```
❌ Firebase Error Details: { code: 'invalid-argument', ... }
⚠️ INVALID ARGUMENT: Check data types
```
- **Check**: Verify `durationHours` and `passengers` are numbers, not strings
- **Console Log**: Check `typeof bookingData.durationHours` should be `"number"`

**4. Uncaught TypeError**
```
Uncaught TypeError: Cannot read property 'value' of null
```
- **Action**: Check that all form elements exist before accessing `.value`
- **Verify**: Form IDs match between HTML and JavaScript

### Network Tab Validation

#### Step-by-Step Network Testing

1. **Before Action**: Clear Network tab
2. **Perform Action**: Click "Submit Booking" or "Update Status"
3. **Check Request**:
   - Find request to `firestore.googleapis.com`
   - Status should be `200 OK` (success)
   - If `403 Forbidden`: Security rule issue
   - If `401 Unauthorized`: Authentication issue
   - If `400 Bad Request`: Invalid data format

4. **Inspect Payload** (Click on request → Payload tab):
   ```json
   {
     "durationHours": 4,  // ✅ Should be number, not "4" (string)
     "passengers": 30,    // ✅ Should be number, not "30" (string)
     "requesterId": "emp_high",  // ✅ Should match authenticated user
     "status": "PENDING"
   }
   ```

5. **Check Response** (Click on request → Response tab):
   - Should contain `name` field with document ID
   - If error, check `error.message` for details

### Testing Checklist

- [ ] Submit booking form → Console shows success message
- [ ] Submit booking form → Network shows `200 OK` for Firestore request
- [ ] Check payload → `durationHours` is number type
- [ ] Check payload → `requesterId` matches authenticated user
- [ ] Try submitting with invalid data → Console shows validation error
- [ ] Try submitting without authentication → Console shows `unauthenticated` error
- [ ] Check real-time listeners → Console shows listener setup messages

---

## B. Responsive Design Mode (Mobile UX Testing)

### Setup
1. Open Developer Tools (F12)
2. Click **Toggle Device Toolbar** icon (or Cmd+Shift+M)
3. Select device preset:
   - **iPhone 12 Pro** (390 × 844)
   - **iPhone SE** (375 × 667) - Small screen
   - **Pixel 5** (393 × 851) - Android
   - **iPad** (768 × 1024) - Tablet

### Mobile UX Testing Checklist

#### Driver Interface (Critical for Mobile)
- [ ] **Start Trip Button**: 
  - Minimum 64px height (check with element inspector)
  - Padding: `py-5 px-8` (20px vertical, 32px horizontal)
  - Text size: `text-xl` (20px)
  - Easily tappable without zooming

- [ ] **Status Buttons**:
  - All buttons have minimum 64px height
  - No horizontal scrolling when buttons are visible
  - Buttons are full-width (`w-full` class)
  - Touch targets are at least 44px apart

- [ ] **Safety Checklist**:
  - Checkboxes are large enough (minimum 20px × 20px)
  - Text is readable without zooming
  - Dark mode visibility is good

#### Employee Booking Form
- [ ] **Form Fields**:
  - All inputs are readable (no zooming required)
  - Date picker opens correctly on mobile
  - Duration dropdown is scrollable
  - No horizontal scrolling

- [ ] **Submit Button**:
  - Large touch target (minimum 44px height)
  - Clearly visible
  - Not hidden by keyboard when typing

#### General Mobile Checks
- [ ] **No Horizontal Scrolling**: 
  - Test at 375px width (iPhone SE)
  - All content fits within viewport
  - No elements overflow horizontally

- [ ] **Touch Targets**:
  - All buttons are at least 44px × 44px
  - Important buttons (Start Trip) are 64px+ height
  - Buttons are not too close together (minimum 8px gap)

- [ ] **Dark Mode (Driver Interface)**:
  - Text is readable (high contrast)
  - Buttons have borders for visibility
  - Background colors are dark (#1a1a1a, #2d2d2d)

### Specific Test Scenarios

#### 1. Driver Workflow (Mobile)
1. Navigate to "My Active Trip"
2. Click "Start Trip" button
   - ✅ Button should be large and easy to tap
   - ✅ No accidental taps on adjacent buttons
3. After starting, click "Arrived at Pickup"
   - ✅ Button should be enabled
   - ✅ Safety checklist should appear
4. Complete safety checklist
   - ✅ Checkboxes are easy to tap
   - ✅ "Start Driving" button becomes enabled
5. Click "Running 10 Mins Late" button
   - ✅ Button is large and clearly visible
   - ✅ Orange color is visible in dark mode

#### 2. Employee Booking (Mobile)
1. Navigate to "New Booking Request"
2. Fill out form on mobile
   - ✅ Date picker works on mobile
   - ✅ Duration dropdown scrolls smoothly
   - ✅ Pickup time dropdown is usable
3. Submit booking
   - ✅ Success message is scrollable
   - ✅ No horizontal scrolling issues

### CSS Validation

Check these CSS properties in Developer Tools:

```css
/* Driver buttons - should have these */
#view-assigned-trips button {
    min-height: 64px !important;
    padding: 1rem 1.5rem !important; /* 16px × 24px */
    font-size: 18px !important;
}

/* Start Trip button - extra large */
#start-trip-btn {
    min-height: 72px !important;
    padding: 1.25rem 2rem !important; /* 20px × 32px */
    font-size: 20px !important;
}

/* Mobile viewport - no horizontal scroll */
@media (max-width: 768px) {
    body {
        overflow-x: hidden;
    }
}
```

---

## C. Common Issues & Solutions

### Issue: 403 Forbidden on Booking Submission
**Symptoms**: Console shows `permission-denied`, Network shows `403`
**Solution**: 
1. Check Firebase Security Rules in `firestore.rules`
2. Verify `requesterId === auth.uid` in booking data
3. Check user is authenticated: `console.log(window.firebaseAuth.currentUser)`

### Issue: Duration Saved as String
**Symptoms**: Console shows `typeof durationHours: "string"`
**Solution**: 
1. Check `Number(tripDuration)` conversion in booking submission
2. Verify `createBooking()` function validates numeric types
3. Check Network payload shows number (not quoted)

### Issue: Horizontal Scrolling on Mobile
**Symptoms**: Content extends beyond viewport width
**Solution**:
1. Add `overflow-x: hidden` to body
2. Check all elements have `max-width: 100%`
3. Use `w-full` class instead of fixed widths

### Issue: Buttons Too Small on Mobile
**Symptoms**: Hard to tap, accidental taps
**Solution**:
1. Verify `min-height: 64px` on all driver buttons
2. Check `padding: 1rem 1.5rem` (p-4 or higher)
3. Ensure buttons have adequate spacing

---

## D. Quick Debug Commands

Paste these in Console to check state:

```javascript
// Check Firebase configuration
console.log('Firebase configured:', window.firebaseDb ? 'Yes' : 'No');

// Check current user
console.log('Current user:', window.firebaseAuth?.currentUser);

// Check app state
console.log('Current role:', appState?.currentRole);
console.log('Current user ID:', appState?.currentUserId);

// Check booking data structure
const testBooking = {
    durationHours: 4,
    passengers: 30
};
console.log('durationHours type:', typeof testBooking.durationHours);
console.log('passengers type:', typeof testBooking.passengers);
```

---

## Summary

**Always Test:**
1. ✅ Console Tab → No red errors
2. ✅ Network Tab → `200 OK` for Firebase requests
3. ✅ Mobile View → No horizontal scrolling, large touch targets
4. ✅ Dark Mode → Driver interface is readable

**Critical Checks:**
- Permission denied errors → Security rules issue
- Invalid argument errors → Data type issue (check durationHours is number)
- Horizontal scrolling → CSS overflow issue
- Small buttons → Touch target size issue

