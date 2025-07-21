# Sai Dental Care Management System

A comprehensive dental care management system built with Angular 17 and JSON Server.

## Features

- 🦷 **Patient Management**: Complete patient registration and profile management
- 📅 **Appointment Scheduling**: Interactive appointment calendar with real-time scheduling
- 💰 **Billing & Payments**: Comprehensive billing system with Indian Rupee (₹) support
- 📊 **Dashboard**: Overview of clinic statistics and key metrics
- 🔔 **Alerts & Notifications**: Appointment reminders and system notifications
- 💳 **Payment Tracking**: Track partial payments and outstanding balances

## Technology Stack

- **Frontend**: Angular 17 with standalone components
- **Backend**: JSON Server (Mock REST API)
- **Styling**: Custom CSS with sky-blue dental care theme
- **Currency**: Indian Rupee (₹) support
- **Forms**: Reactive Forms with validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Running the Application

#### Development Mode (Recommended)
This starts both JSON Server and Angular dev server concurrently:

```bash
npm run dev
```

This will start:
- **JSON Server**: http://localhost:3001 (REST API)
- **Angular App**: http://localhost:4200 (Frontend)

#### Individual Servers

**JSON Server only:**
```bash
npm run json-server
```

**Angular Dev Server only:**
```bash
npm start
```

## API Endpoints

The JSON Server provides the following endpoints:

- **Patients**: http://localhost:3001/patients
- **Appointments**: http://localhost:3001/appointments
- **Bills**: http://localhost:3001/bills
- **Payments**: http://localhost:3001/payments
- **Service Templates**: http://localhost:3001/serviceTemplates

### Example API Usage

```bash
# Get all patients
curl http://localhost:3001/patients

# Get specific patient
curl http://localhost:3001/patients/patient_001

# Create new patient
curl -X POST http://localhost:3001/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'
```

## Sample Data

The application comes with pre-populated sample data including:
- 3 Sample patients with Indian names and addresses
- Sample appointments
- Bills with Indian Rupee amounts
- Payment records
- Service templates with Indian pricing

## Project Structure

```
src/
├── app/
│   ├── components/         # Angular components
│   │   ├── dashboard/      # Main dashboard
│   │   ├── patients/       # Patient management
│   │   ├── appointments/   # Appointment scheduling
│   │   └── billing/        # Billing and payments
│   ├── models/            # TypeScript interfaces
│   ├── services/          # Angular services
│   └── assets/            # Static assets
├── db.json               # JSON Server database
└── package.json          # Project dependencies
```

## Features in Detail

### Patient Management
- Add, edit, and delete patients
- Complete patient profiles with medical history
- Emergency contact information
- Visit tracking

### Appointment Scheduling
- Calendar view with time slots
- Appointment status management
- Doctor assignment
- Reminder system

### Billing System
- Create bills with multiple items
- Track payments (full and partial)
- Outstanding balance monitoring
- Indian Rupee currency support
- Service templates for quick billing

### Dashboard
- Key performance indicators
- Today's appointments overview
- Patient balance summary
- Quick action buttons

## Currency Support

The application uses Indian Rupee (₹) throughout:
- All monetary values display ₹ symbol
- Pricing in Indian context (₹2,000 for cleaning, ₹12,000 for root canal, etc.)
- Bills and payments in INR

## Development

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
