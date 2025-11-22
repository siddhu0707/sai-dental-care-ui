import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>Backend Connection Test</h2>
      <div class="test-results">
        <div *ngFor="let result of testResults" [ngClass]="result.status">
          <strong>{{result.test}}:</strong> {{result.message}}
        </div>
      </div>
      <button (click)="runTests()" class="test-button">Run Backend Tests</button>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      margin: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .test-results {
      margin: 20px 0;
    }
    .success {
      color: green;
      margin: 5px 0;
    }
    .error {
      color: red;
      margin: 5px 0;
    }
    .test-button {
      background: #007bff;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class BackendTestComponent {
  testResults: any[] = [];

  constructor(private http: HttpClient) {}

  runTests() {
    this.testResults = [];
    this.testBasicConnection();
    this.testPatientControllerTest();
    this.testBackendConnection();
    this.testPatientsEndpoint();
    this.testCreatePatient();
  }

  private testBasicConnection() {
    console.log('Testing basic backend connection...');
    this.http.get('http://localhost:8080/api/test', { responseType: 'text' }).subscribe({
      next: (data) => {
        console.log('Basic backend connection successful:', data);
        this.testResults.push({
          test: 'Basic Backend Connection',
          message: `Success - ${data}`,
          status: 'success'
        });
      },
      error: (error) => {
        console.error('Basic backend connection failed:', error);
        this.testResults.push({
          test: 'Basic Backend Connection',
          message: `Failed - ${error.status}: ${error.message}`,
          status: 'error'
        });
      }
    });
  }

  private testPatientControllerTest() {
    console.log('Testing patient controller...');
    this.http.get('http://localhost:8080/api/patients/test', { responseType: 'text' }).subscribe({
      next: (data) => {
        console.log('Patient controller test successful:', data);
        this.testResults.push({
          test: 'Patient Controller Test',
          message: `Success - ${data}`,
          status: 'success'
        });
      },
      error: (error) => {
        console.error('Patient controller test failed:', error);
        this.testResults.push({
          test: 'Patient Controller Test',
          message: `Failed - ${error.status}: ${error.message}`,
          status: 'error'
        });
      }
    });
  }

  private testBackendConnection() {
    console.log('Testing backend connection...');
    this.http.get('http://localhost:8080/api/patients').subscribe({
      next: (data) => {
        console.log('Backend connection successful:', data);
        this.testResults.push({
          test: 'Backend Connection',
          message: 'Success - Connected to Spring Boot backend',
          status: 'success'
        });
      },
      error: (error) => {
        console.error('Backend connection failed:', error);
        this.testResults.push({
          test: 'Backend Connection',
          message: `Failed - ${error.status}: ${error.message}`,
          status: 'error'
        });
      }
    });
  }

  private testPatientsEndpoint() {
    this.http.get('http://localhost:8080/api/patients').subscribe({
      next: (data: any) => {
        console.log('Patients endpoint response:', data);
        this.testResults.push({
          test: 'Patients Endpoint',
          message: `Success - Retrieved ${data.length} patients`,
          status: 'success'
        });
      },
      error: (error) => {
        console.error('Patients endpoint failed:', error);
        this.testResults.push({
          test: 'Patients Endpoint',
          message: `Failed - ${error.status}: ${error.message}`,
          status: 'error'
        });
      }
    });
  }

  private testCreatePatient() {
    const testPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test@example.com',
      phone: '555-0123',
      dateOfBirth: '1990-01-01',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '555-0124',
        relationship: 'Friend'
      },
      medicalHistory: [],
      allergies: [],
      notes: 'Test patient for API testing'
    };

    console.log('Testing create patient with data:', testPatient);

    this.http.post('http://localhost:8080/api/patients', testPatient).subscribe({
      next: (response) => {
        console.log('Create patient successful:', response);
        this.testResults.push({
          test: 'Create Patient',
          message: 'Success - Patient created successfully',
          status: 'success'
        });
      },
      error: (error) => {
        console.error('Create patient failed:', error);
        this.testResults.push({
          test: 'Create Patient',
          message: `Failed - ${error.status}: ${error.message}`,
          status: 'error'
        });
      }
    });
  }
}
