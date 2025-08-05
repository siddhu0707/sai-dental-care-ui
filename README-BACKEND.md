# Sai Dental Care - Backend Integration

This project now includes a Java Spring Boot backend with H2 file-based database integration.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Node.js and npm (for the Angular frontend)

## Project Structure

```
.
├── backend/                     # Java Spring Boot backend
│   ├── src/main/java/
│   │   └── com/sai/dental/
│   │       ├── controller/      # REST Controllers
│   │       ├── entity/          # JPA Entities
│   │       ├── repository/      # Spring Data Repositories
│   │       ├── service/         # Business Logic Services
│   │       └── config/          # Configuration Classes
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml                  # Maven dependencies
├── src/                         # Angular frontend
└── data/                        # H2 database files (auto-created)
```

## Getting Started

### Option 1: Run Both Frontend and Backend Together

```bash
# Install frontend dependencies
npm install

# Start both backend and frontend
npm run start-full
```

### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
# Build and run the Spring Boot backend
npm run backend

# Or manually:
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
# Start the Angular development server
npm start
```

## Database

The backend uses H2 file-based database that automatically creates the database file at `./data/dental_care.mv.db`.

### H2 Console Access

You can access the H2 database console at: http://localhost:8080/h2-console

**Connection details:**
- JDBC URL: `jdbc:h2:file:./data/dental_care`
- Username: `sa`
- Password: `password`

## API Endpoints

The backend exposes REST APIs at `http://localhost:8080/api/`:

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/{id}` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/{id}` - Update patient
- `PATCH /api/patients/{id}` - Partial update patient
- `DELETE /api/patients/{id}` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Delete appointment
- `POST /api/appointments/{id}/send-reminder` - Send appointment reminder

### Bills
- `GET /api/bills` - Get all bills
- `GET /api/bills/{id}` - Get bill by ID
- `POST /api/bills` - Create new bill
- `PUT /api/bills/{id}` - Update bill
- `DELETE /api/bills/{id}` - Delete bill
- `POST /api/bills/{id}/mark-paid` - Mark bill as paid

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment

### Service Templates
- `GET /api/serviceTemplates` - Get all service templates
- `POST /api/serviceTemplates` - Create new service template

## Sample Data

The backend automatically creates sample data on first startup, including:
- 2 sample patients (Rajesh Kumar and Priya Sharma)
- Sample appointments
- Sample bills and payments
- Service templates (Cleaning, Extraction, Root Canal, etc.)

## Development Notes

### Frontend Changes
- Updated `src/app/services/api.service.ts` to point to Spring Boot backend (`http://localhost:8080/api`)
- All existing Angular functionality remains the same

### Backend Features
- **JPA Entities**: All Angular models converted to JPA entities
- **H2 Database**: File-based database with automatic schema creation
- **REST APIs**: Full CRUD operations for all entities
- **CORS**: Configured for Angular frontend on port 4200
- **Data Initialization**: Automatic sample data creation
- **Validation**: Input validation using Jakarta Bean Validation

### Running Legacy Mode (JSON Server)

If you want to use the original JSON server:

```bash
npm run dev
```

This will start the Angular frontend with the JSON server backend.

## Troubleshooting

1. **Port Conflicts**: 
   - Backend runs on port 8080
   - Frontend runs on port 4200
   - Ensure these ports are available

2. **Maven Issues**:
   - Ensure Java 17+ is installed
   - Ensure Maven is installed and in PATH

3. **Database Issues**:
   - The H2 database files are created in `./data/` directory
   - If you encounter database issues, delete the `./data/` folder to reset

4. **CORS Issues**:
   - Backend is configured to accept requests from `http://localhost:4200`
   - If running frontend on different port, update CORS configuration

## Next Steps

- Add authentication and authorization
- Implement proper error handling and logging
- Add unit and integration tests
- Configure production database (PostgreSQL/MySQL)
- Add data validation and business rules
- Implement reporting and analytics features
