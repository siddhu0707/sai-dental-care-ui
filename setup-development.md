# Development Setup Guide

## Setting Up the Full Stack Application

This application consists of:
1. **Frontend**: Angular 17 application
2. **Backend**: Java Spring Boot application with H2 database

## Prerequisites

Before running the application, ensure you have:

- **Node.js 18+** and **npm**
- **Java 17+** (JDK)
- **Maven 3.6+**

### Checking Prerequisites

```bash
# Check Node.js and npm
node --version
npm --version

# Check Java
java -version

# Check Maven
mvn --version
```

## Quick Start

### Option 1: Run Everything with One Command

```bash
# Install frontend dependencies
npm install

# Start both backend and frontend
npm run start-full
```

This will:
1. Start the Spring Boot backend on port 8080
2. Start the Angular frontend on port 4200
3. Automatically open the application in your browser

### Option 2: Run Components Separately

**Terminal 1 - Start Backend:**
```bash
npm run backend
# OR manually:
cd backend
mvn spring-boot:run
```

**Terminal 2 - Start Frontend:**
```bash
npm start
```

## Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **H2 Database Console**: http://localhost:8080/h2-console

### H2 Database Connection Details
- **JDBC URL**: `jdbc:h2:file:./data/dental_care`
- **Username**: `sa`
- **Password**: `password`

## Troubleshooting

### Backend Issues

1. **Java/Maven not found:**
   ```bash
   # Install Java 17
   # On Ubuntu/Debian:
   sudo apt update
   sudo apt install openjdk-17-jdk maven
   
   # On macOS (with Homebrew):
   brew install openjdk@17 maven
   
   # On Windows:
   # Download from Oracle or use Chocolatey:
   choco install openjdk17 maven
   ```

2. **Port 8080 already in use:**
   ```bash
   # Find process using port 8080
   lsof -i :8080
   # Kill the process
   kill -9 <PID>
   ```

3. **Database issues:**
   ```bash
   # Delete database files to reset
   rm -rf data/
   ```

### Frontend Issues

1. **Node modules issues:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port 4200 already in use:**
   ```bash
   ng serve --port 4201
   ```

## API Testing

You can test the backend APIs using curl or any REST client:

```bash
# Get all patients
curl http://localhost:8080/api/patients

# Get all appointments
curl http://localhost:8080/api/appointments

# Get all bills
curl http://localhost:8080/api/bills
```

## Database Schema

The H2 database will automatically create tables for:
- **patients**: Patient information with embedded address and emergency contact
- **appointments**: Appointment scheduling with reminder functionality
- **bills**: Billing information with line items
- **bill_items**: Individual line items for bills
- **payments**: Payment records
- **service_templates**: Predefined service templates

## Sample Data

The application automatically creates sample data including:
- 2 sample patients
- Sample appointments
- Sample bills and payments
- Service templates for common dental procedures

## Development vs Production

### Development Mode
- Uses H2 file-based database
- Database console enabled
- CORS enabled for localhost:4200
- Sample data auto-generated

### Production Considerations
- Switch to PostgreSQL/MySQL
- Disable H2 console
- Configure proper CORS origins
- Add proper authentication/authorization
- Add logging and monitoring
- Configure external database connection

## Next Steps

1. Test all CRUD operations through the Angular UI
2. Verify data persistence by restarting the application
3. Check the H2 console to view database structure
4. Test API endpoints directly using curl or Postman
5. Add additional features as needed
