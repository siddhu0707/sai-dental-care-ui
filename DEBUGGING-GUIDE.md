# Patient API Debug Guide

## Issue
The create patient API is not getting hit when adding a patient from the UI.

## Steps to Debug

### 1. Check if Backend is Running
```bash
# In your project root directory, start the backend
npm run backend

# OR manually:
cd backend
mvn spring-boot:run
```

**Expected Output:**
- Backend should start on port 8080
- You should see console messages like:
  ```
  Started SaiDentalBackendApplication in X.XXX seconds
  ```

### 2. Verify Backend Connection
1. Open your browser to http://localhost:4200 (Angular app)
2. Go to the Dashboard
3. Scroll down to see the "Backend Connection Test" widget
4. Click "Run Backend Tests"

**Expected Results:**
- ✅ Backend Connection: Success
- ✅ Patients Endpoint: Success  
- ✅ Create Patient: Success

### 3. Check Browser Developer Tools
1. Open the Angular app (http://localhost:4200)
2. Open Browser Developer Tools (F12)
3. Go to the **Console** tab
4. Try to add a patient from the Patients page

**Look for:**
- Console logs showing "API Service: Creating patient with data:"
- Console logs showing "API Service: Making POST request to:"
- Any error messages in red

### 4. Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try to add a patient
3. Look for a POST request to `http://localhost:8080/api/patients`

**Expected:**
- POST request should appear
- Status should be 200 (success) or 201 (created)
- Response should contain the created patient data

**If you see:**
- **Status 0 or failed**: Backend is not running
- **Status 404**: Wrong URL or endpoint not found
- **Status 403/405**: CORS issue
- **Status 500**: Server error

### 5. Check Backend Console
If the backend is running, check the console where you started it.

**Look for:**
- "Creating patient: [First Name] [Last Name]"
- "Patient data: [patient object]"
- "Patient saved with ID: [number]"

### 6. Common Issues and Solutions

#### Issue: Backend Not Running
**Symptoms:** Network requests fail, status 0 in Network tab
**Solution:**
```bash
# Make sure Java 17+ is installed
java -version

# Make sure Maven is installed  
mvn --version

# Start the backend
npm run backend
```

#### Issue: CORS Error
**Symptoms:** CORS policy error in console
**Solution:** Backend CORS is configured to allow all origins. If still having issues:
1. Make sure backend is running on port 8080
2. Make sure frontend is running on port 4200

#### Issue: Wrong API URL
**Symptoms:** 404 errors
**Solution:** Check that `src/app/services/api.service.ts` has:
```typescript
private baseUrl = 'http://localhost:8080/api';
```

#### Issue: Data Format Problems
**Symptoms:** 400 Bad Request errors
**Solution:** Check backend console for validation errors

### 7. Manual API Test
You can test the API directly using curl:

```bash
# Test GET patients
curl http://localhost:8080/api/patients

# Test POST patient
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient", 
    "email": "test@example.com",
    "phone": "555-0123",
    "dateOfBirth": "1990-01-01",
    "address": {
      "street": "123 Test St",
      "city": "Test City", 
      "state": "TS",
      "zipCode": "12345"
    },
    "emergencyContact": {
      "name": "Emergency Contact",
      "phone": "555-0124",
      "relationship": "Friend"  
    },
    "medicalHistory": [],
    "allergies": [],
    "notes": "Test patient"
  }'
```

### 8. Reset Database
If you need to reset the database:
```bash
# Stop the backend
# Delete the database files
rm -rf data/
# Restart the backend
npm run backend
```

## Quick Checklist

- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 4200  
- [ ] No CORS errors in browser console
- [ ] POST request appears in Network tab
- [ ] Backend console shows "Creating patient" message
- [ ] API service baseUrl is correct: `http://localhost:8080/api`

## Next Steps

If the issue persists after checking all above:
1. Share the exact error messages from browser console
2. Share the Network tab details (status code, response)
3. Share the backend console output when trying to create a patient
