import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrescriptionItem {
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Medicine {
  name: string;
  strength: string;
  category: string;
}

interface Prescription {
  id?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientMobile: string;
  date: Date;
  diagnosis: string;
  prescriptionItems: PrescriptionItem[];
  notes: string;
  nextVisitDate?: Date;
  doctorName: string;
  clinicName: string;
}

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  prescriptionForm: FormGroup;
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  showPreview = false;
  isGeneratingPDF = false;

  // Common dental medicines
  commonMedicines: Medicine[] = [
    // Antibiotics
    { name: 'Amoxicillin', strength: '500mg', category: 'Antibiotic' },
    { name: 'Amoxicillin + Clavulanic Acid', strength: '625mg', category: 'Antibiotic' },
    { name: 'Azithromycin', strength: '500mg', category: 'Antibiotic' },
    { name: 'Clindamycin', strength: '300mg', category: 'Antibiotic' },
    { name: 'Metronidazole', strength: '400mg', category: 'Antibiotic' },

    // Pain Relievers
    { name: 'Ibuprofen', strength: '400mg', category: 'Pain Relief' },
    { name: 'Paracetamol', strength: '500mg', category: 'Pain Relief' },
    { name: 'Diclofenac', strength: '50mg', category: 'Pain Relief' },
    { name: 'Tramadol', strength: '50mg', category: 'Pain Relief' },
    { name: 'Aceclofenac', strength: '100mg', category: 'Pain Relief' },

    // Mouth Care
    { name: 'Chlorhexidine Mouthwash', strength: '0.2%', category: 'Mouth Care' },
    { name: 'Benzydamine HCl', strength: '0.15%', category: 'Mouth Care' },
    { name: 'Hydrogen Peroxide', strength: '1.5%', category: 'Mouth Care' },
    { name: 'Povidone Iodine', strength: '2%', category: 'Mouth Care' },

    // Vitamins & Supplements
    { name: 'Calcium + Vitamin D3', strength: '500mg+250IU', category: 'Supplement' },
    { name: 'Vitamin B Complex', strength: 'Standard', category: 'Supplement' },
    { name: 'Folic Acid', strength: '5mg', category: 'Supplement' },

    // Topical Applications
    { name: 'Dentogel (Choline Salicylate)', strength: '8.7%', category: 'Topical' },
    { name: 'Mucopain Gel', strength: '2%', category: 'Topical' },
    { name: 'Lignocaine Gel', strength: '2%', category: 'Topical' }
  ];

  // Current prescription data
  currentPrescription: Prescription = {
    patientId: '',
    patientName: '',
    patientAge: 0,
    patientGender: '',
    patientMobile: '',
    date: new Date(),
    diagnosis: '',
    prescriptionItems: [],
    notes: '',
    doctorName: 'Dr. Sneha Funde, BDS (MUHS)',
    clinicName: 'Sai Dental Care'
  };

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.prescriptionForm = this.createPrescriptionForm();
  }

  ngOnInit() {
    this.loadPatients();
  }

  createPrescriptionForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      diagnosis: ['', Validators.required],
      prescriptionItems: this.fb.array([this.createPrescriptionItem()]),
      notes: [''],
      nextVisitDate: ['']
    });
  }

  createPrescriptionItem(): FormGroup {
    return this.fb.group({
      medicine: ['', Validators.required],
      dosage: ['', Validators.required],
      duration: ['', Validators.required],
      instructions: ['']
    });
  }

  get prescriptionItems() {
    return this.prescriptionForm.get('prescriptionItems') as FormArray;
  }

  addPrescriptionItem() {
    this.prescriptionItems.push(this.createPrescriptionItem());
  }

  removePrescriptionItem(index: number) {
    if (this.prescriptionItems.length > 1) {
      this.prescriptionItems.removeAt(index);
    }
  }

  loadPatients() {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  onPatientSelect() {
    const patientId = this.prescriptionForm.get('patientId')?.value;
    if (patientId) {
      this.selectedPatient = this.patients.find(p => p.id === patientId) || null;
      if (this.selectedPatient) {
        this.updateCurrentPrescription();
      }
    }
  }

  updateCurrentPrescription() {
    if (!this.selectedPatient) return;

    const formValue = this.prescriptionForm.value;
    const today = new Date();
    
    // Calculate age from date of birth
    const age = today.getFullYear() - this.selectedPatient.dateOfBirth.getFullYear();
    
    this.currentPrescription = {
      ...this.currentPrescription,
      patientId: this.selectedPatient.id,
      patientName: `${this.selectedPatient.firstName} ${this.selectedPatient.lastName}`,
      patientAge: age,
      patientGender: this.selectedPatient.gender || 'Not specified',
      patientMobile: this.selectedPatient.phone,
      date: today,
      diagnosis: formValue.diagnosis,
      prescriptionItems: formValue.prescriptionItems,
      notes: formValue.notes,
      nextVisitDate: formValue.nextVisitDate ? new Date(formValue.nextVisitDate) : undefined
    };
  }

  previewPrescription() {
    // Check if patient is selected
    if (!this.selectedPatient) {
      alert('Please select a patient first.');
      return;
    }

    // Check if diagnosis is filled
    const diagnosis = this.prescriptionForm.get('diagnosis')?.value;
    if (!diagnosis || diagnosis.trim() === '') {
      alert('Please enter a diagnosis.');
      return;
    }

    // Check if at least one prescription item is valid
    const items = this.prescriptionItems.value;
    const validItems = items.filter((item: any) => {
      const hasMedicine = item.medicine && item.medicine.trim() !== '';
      const hasDosage = item.dosage && item.dosage.trim() !== '';
      const hasDuration = item.duration && item.duration.trim() !== '';
      return hasMedicine && hasDosage && hasDuration;
    });

    if (validItems.length === 0) {
      alert('Please add at least one complete prescription item (medicine, dosage, and duration).');
      return;
    }

    // If all validations pass, show preview
    this.updateCurrentPrescription();
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
  }

  async generatePDF() {
    if (!this.selectedPatient) return;
    
    this.isGeneratingPDF = true;
    
    try {
      // Update prescription data
      this.updateCurrentPrescription();
      
      // Get the prescription preview element
      const element = document.getElementById('prescription-preview');
      if (!element) {
        throw new Error('Prescription preview element not found');
      }

      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      const fileName = `Prescription_${this.currentPrescription.patientName}_${this.formatDate(this.currentPrescription.date)}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      this.isGeneratingPDF = false;
    }
  }

  resetForm() {
    this.prescriptionForm.reset();
    this.selectedPatient = null;
    this.showPreview = false;
    
    // Reset prescription items to have at least one
    while (this.prescriptionItems.length > 0) {
      this.prescriptionItems.removeAt(0);
    }
    this.prescriptionItems.push(this.createPrescriptionItem());
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB');
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Medicine dropdown helper methods
  isCustomMedicine(index: number): boolean {
    const medicineControl = this.prescriptionItems.at(index).get('medicine');
    return medicineControl?.value === 'custom';
  }

  getCustomMedicineValue(index: number): string {
    const medicineControl = this.prescriptionItems.at(index).get('medicine');
    if (medicineControl?.value && medicineControl.value !== 'custom') {
      return medicineControl.value;
    }
    return '';
  }

  setCustomMedicine(index: number, event: any): void {
    const medicineControl = this.prescriptionItems.at(index).get('medicine');
    medicineControl?.setValue(event.target.value);
  }

  onMedicineChange(index: number, event: any): void {
    const selectedValue = event.target.value;
    const medicineControl = this.prescriptionItems.at(index).get('medicine');

    if (selectedValue === 'custom') {
      medicineControl?.setValue('');
    } else if (selectedValue !== '') {
      medicineControl?.setValue(selectedValue);
    }
  }

  canPreview(): boolean {
    if (!this.selectedPatient) return false;

    const diagnosis = this.prescriptionForm.get('diagnosis')?.value;
    if (!diagnosis || diagnosis.trim() === '') return false;

    const items = this.prescriptionItems.value;
    const validItems = items.filter((item: any) => {
      const hasMedicine = item.medicine && item.medicine.trim() !== '';
      const hasDosage = item.dosage && item.dosage.trim() !== '';
      const hasDuration = item.duration && item.duration.trim() !== '';
      return hasMedicine && hasDosage && hasDuration;
    });

    return validItems.length > 0;
  }

  // Print functionality
  printPrescription(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the prescription.');
      return;
    }

    const prescriptionElement = document.getElementById('prescription-preview');
    if (!prescriptionElement) {
      alert('Prescription preview not found.');
      return;
    }

    const printContent = prescriptionElement.innerHTML;
    const printStyles = `
      <style>
        @page { margin: 20mm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
        .prescription-preview { background: white; padding: 20px; }
        .prescription-header-section { display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; }
        .clinic-logo-section { display: flex; align-items: center; gap: 15px; }
        .logo-placeholder { width: 60px; height: 60px; background: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .tooth-icon { font-size: 2rem; }
        .clinic-name { font-size: 1.8rem; font-weight: bold; color: #0284c7; margin: 0; }
        .doctor-name { font-size: 1.2rem; color: #374151; margin: 5px 0; }
        .doctor-title { color: #6b7280; margin: 0; }
        .clinic-contact .address { text-align: right; font-size: 0.9rem; color: #4b5563; }
        .divider { height: 2px; background: linear-gradient(to right, #0ea5e9, #0284c7); margin: 15px 0; }
        .section-header { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: bold; color: #0284c7; margin-bottom: 10px; }
        .patient-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .detail-item { padding: 5px 0; }
        .diagnosis-content, .notes-content { background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 4px solid #0ea5e9; }
        .prescription-item-display { display: flex; gap: 10px; margin-bottom: 15px; }
        .item-number { font-weight: bold; color: #0284c7; }
        .medicine-name { font-weight: bold; margin-bottom: 5px; }
        .medicine-details { color: #4b5563; }
        .followup-content { padding: 10px 0; }
        .underline { display: inline-block; border-bottom: 1px solid #000; width: 150px; }
        .prescription-footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: end; }
        .signature-section { text-align: center; }
        .signature-placeholder { width: 150px; height: 60px; border-bottom: 1px solid #000; margin-bottom: 5px; }
        .signature-label { margin: 5px 0 0 0; font-weight: bold; }
        .signature-title { margin: 0; font-size: 0.9rem; color: #6b7280; }
        .watermark { opacity: 0.1; }
        .tooth-watermark { font-size: 4rem; }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${this.currentPrescription.patientName}</title>
          ${printStyles}
        </head>
        <body>
          <div class="prescription-preview">${printContent}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
