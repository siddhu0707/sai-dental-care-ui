import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { Appointment, CreateAppointmentRequest, AppointmentType, AppointmentStatus, TimeSlot } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  activeTab = 'today';
  tabs = [
    { key: 'today', label: "Today's Schedule" },
    { key: 'all', label: 'All Appointments' },
    { key: 'calendar', label: 'Calendar View' }
  ];

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  tomorrowAppointments: Appointment[] = [];
  todaySlots: TimeSlot[] = [];
  tomorrowSlots: TimeSlot[] = [];

  patients: Patient[] = [];
  searchQuery = '';
  statusFilter = '';
  dateFilter = '';

  showScheduleModal = false;
  showViewModal = false;
  showReminderModal = false;
  editingAppointment: Appointment | null = null;
  selectedAppointment: Appointment | null = null;

  // Reminder functionality
  selectedAppointments: string[] = [];
  allTodaySelected = false;
  allUpcomingSelected = false;
  reminderForm: FormGroup;

  appointmentForm: FormGroup;
  appointmentTypes = Object.values(AppointmentType);
  availableSlots: TimeSlot[] = [];

  // Calendar view properties
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();
  currentWeekDays: Date[] = [];
  workingHours: string[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private translationService: TranslationService
  ) {
    this.appointmentForm = this.createAppointmentForm();
    this.reminderForm = this.createReminderForm();
    this.initializeWeek();
    this.generateWorkingHours();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.appointmentService.getAppointments().subscribe(appointments => {
      this.appointments = appointments;
      this.filterAppointments();
      this.loadTodayData();
    });

    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  loadTodayData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.todayAppointments = this.appointmentService.getAppointmentsByDate(today);
    this.tomorrowAppointments = this.appointmentService.getAppointmentsByDate(tomorrow);
    this.todaySlots = this.appointmentService.getAvailableSlots(today);
    this.tomorrowSlots = this.appointmentService.getAvailableSlots(tomorrow);
  }

  createAppointmentForm(): FormGroup {
    return this.fb.group({
      patientId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      startTime: ['', Validators.required],
      type: ['', Validators.required],
      duration: [30, Validators.required],
      doctorName: ['Dr. Smith'],
      notes: ['']
    });
  }

  filterAppointments() {
    let filtered = [...this.appointments];

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(appointment =>
        appointment.status === this.statusFilter
      );
    }

    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(appointment =>
        this.isSameDay(appointment.appointmentDate, filterDate)
      );
    }

    filtered.sort((a, b) => {
      const dateComparison = a.appointmentDate.getTime() - b.appointmentDate.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.startTime.localeCompare(b.startTime);
    });

    this.filteredAppointments = filtered;
  }

  onDateChange() {
    const dateValue = this.appointmentForm.get('appointmentDate')?.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      this.availableSlots = this.appointmentService.getAvailableSlots(selectedDate);
    }
  }

  viewAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showViewModal = true;
  }

  editAppointment(appointment: Appointment) {
    this.editingAppointment = appointment;
    this.populateForm(appointment);
    this.showScheduleModal = true;
  }

  populateForm(appointment: Appointment) {
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
      startTime: appointment.startTime,
      type: appointment.type,
      duration: appointment.duration,
      doctorName: appointment.doctorName,
      notes: appointment.notes
    });
    this.onDateChange();
  }

  confirmAppointment(id: string) {
    this.appointmentService.confirmAppointment(id);
  }

  cancelAppointment(id: string) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id);
    }
  }

  markCompleted(id: string) {
    this.appointmentService.markAsCompleted(id);
  }

  sendReminder(id: string) {
    this.appointmentService.sendReminder(id);
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formData = this.appointmentForm.value;

      const appointmentData: CreateAppointmentRequest = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate)
      };

      if (this.editingAppointment) {
        this.appointmentService.updateAppointment(this.editingAppointment.id, appointmentData).subscribe();
      } else {
        this.appointmentService.createAppointment(appointmentData).subscribe();
      }

      this.closeModal();
    }
  }

  closeModal() {
    this.showScheduleModal = false;
    this.showViewModal = false;
    this.editingAppointment = null;
    this.selectedAppointment = null;
    this.appointmentForm.reset();
    this.appointmentForm = this.createAppointmentForm();
    this.availableSlots = [];
  }

  // Calendar view methods
  initializeWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + mondayOffset);

    this.currentWeekEnd = new Date(this.currentWeekStart);
    this.currentWeekEnd.setDate(this.currentWeekStart.getDate() + 6);

    this.generateWeekDays();
  }

  generateWeekDays() {
    this.currentWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(this.currentWeekStart);
      day.setDate(this.currentWeekStart.getDate() + i);
      this.currentWeekDays.push(day);
    }
  }

  generateWorkingHours() {
    this.workingHours = [];
    for (let hour = 9; hour < 21; hour++) {
      this.workingHours.push(`${hour.toString().padStart(2, '0')}:00`);
      this.workingHours.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
    this.generateWeekDays();
  }

  getAppointmentsForTimeSlot(date: Date, time: string): Appointment[] {
    return this.appointments.filter(appointment =>
      this.isSameDay(appointment.appointmentDate, date) && appointment.startTime === time
    );
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  getAppointmentTypeTranslation(type: string): string {
    const typeMap: { [key: string]: string } = {
      'CLEANING': 'appointments.types.cleaning',
      'CHECKUP': 'appointments.types.checkup',
      'FILLING': 'appointments.types.filling',
      'EXTRACTION': 'appointments.types.extraction',
      'ROOT_CANAL': 'appointments.types.rootCanal',
      'CROWN': 'appointments.types.crown',
      'CONSULTATION': 'appointments.types.consultation',
      'FOLLOW_UP': 'appointments.types.followUp',
      'EMERGENCY': 'appointments.types.emergency'
    };

    const translationKey = typeMap[type] || type;
    return this.translationService.translate(translationKey);
  }

  // Reminder functionality methods
  createReminderForm(): FormGroup {
    return this.fb.group({
      message: ['', Validators.required],
      method: ['sms'],
      sendTime: ['now']
    });
  }

  toggleAppointmentSelection(appointmentId: string) {
    const index = this.selectedAppointments.indexOf(appointmentId);
    if (index > -1) {
      this.selectedAppointments.splice(index, 1);
    } else {
      this.selectedAppointments.push(appointmentId);
    }
    this.updateSelectAllState();
  }

  isAppointmentSelected(appointmentId: string): boolean {
    return this.selectedAppointments.includes(appointmentId);
  }

  selectAllUpcomingAppointments() {
    if (this.allUpcomingSelected) {
      this.selectedAppointments = [];
    } else {
      const allUpcomingAppointments = [...this.todayAppointments, ...this.tomorrowAppointments];
      this.selectedAppointments = allUpcomingAppointments.map(appointment => appointment.id);
    }
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    const totalUpcomingAppointments = this.todayAppointments.length + this.tomorrowAppointments.length;
    this.allTodaySelected = this.todayAppointments.length > 0 &&
      this.selectedAppointments.length === this.todayAppointments.length;
    this.allUpcomingSelected = totalUpcomingAppointments > 0 &&
      this.selectedAppointments.length === totalUpcomingAppointments;
  }

  closeReminderModal() {
    this.showReminderModal = false;
    this.reminderForm.reset({
      message: '',
      method: 'sms',
      sendTime: 'now'
    });
  }

  sendBulkReminders() {
    if (this.reminderForm.valid && this.selectedAppointments.length > 0) {
      const formData = this.reminderForm.value;

      // Get appointment details for the message
      const allUpcomingAppointments = [...this.todayAppointments, ...this.tomorrowAppointments];
      const selectedAppointmentDetails = allUpcomingAppointments.filter(
        appointment => this.selectedAppointments.includes(appointment.id)
      );

      // Simulate sending reminders (in a real app, this would call an API)
      this.selectedAppointments.forEach(appointmentId => {
        const appointment = allUpcomingAppointments.find(a => a.id === appointmentId);
        if (appointment) {
          // Update the appointment with reminder sent status
          this.appointmentService.sendReminder(appointmentId);

          // Show success message (in a real app, you'd handle the actual sending)
          console.log(`Reminder sent to ${appointment.patientName}:`, {
            message: formData.message,
            method: formData.method,
            sendTime: formData.sendTime,
            appointmentTime: appointment.startTime,
            appointmentType: appointment.type
          });
        }
      });

      // Show success notification
      alert(`Reminders sent successfully to ${this.selectedAppointments.length} patients!`);

      // Reset selection and close modal
      this.selectedAppointments = [];
      this.updateSelectAllState();
      this.closeReminderModal();

      // Reload data to reflect updated reminder status
      this.loadData();
    }
  }

  // Helper method to format custom reminder message with appointment details
  formatReminderMessage(baseMessage: string, appointment: Appointment): string {
    return `${baseMessage}\n\nAppointment Details:\n📅 Date: ${appointment.appointmentDate.toLocaleDateString()}\n🕐 Time: ${appointment.startTime}\n🏥 Type: ${appointment.type}\n👨‍⚕️ Doctor: ${appointment.doctorName}`;
  }
}
