import { Injectable } from '@angular/core';
import { Patient } from '../models/patient.model';
import { Appointment } from '../models/appointment.model';
import { Bill } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {

  constructor() { }

  /**
   * Send WhatsApp message using WhatsApp Web API
   * @param phoneNumber Phone number with country code (e.g., +919876543210)
   * @param message Message to send
   */
  sendMessage(phoneNumber: string, message: string): void {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Send appointment reminder via WhatsApp
   */
  sendAppointmentReminder(patient: Patient, appointment: Appointment): void {
    const message = this.generateAppointmentReminderMessage(patient, appointment);
    this.sendMessage(patient.phone, message);
  }

  /**
   * Send appointment confirmation via WhatsApp
   */
  sendAppointmentConfirmation(patient: Patient, appointment: Appointment): void {
    const message = this.generateAppointmentConfirmationMessage(patient, appointment);
    this.sendMessage(patient.phone, message);
  }

  /**
   * Send bill notification via WhatsApp
   */
  sendBillNotification(patient: Patient, bill: Bill): void {
    const message = this.generateBillNotificationMessage(patient, bill);
    this.sendMessage(patient.phone, message);
  }

  /**
   * Send payment confirmation via WhatsApp
   */
  sendPaymentConfirmation(patient: Patient, bill: Bill, amount: number): void {
    const message = this.generatePaymentConfirmationMessage(patient, bill, amount);
    this.sendMessage(patient.phone, message);
  }

  /**
   * Send general message to patient
   */
  sendCustomMessage(patient: Patient, message: string): void {
    this.sendMessage(patient.phone, message);
  }

  /**
   * Send welcome message to new patient
   */
  sendWelcomeMessage(patient: Patient): void {
    const message = this.generateWelcomeMessage(patient);
    this.sendMessage(patient.phone, message);
  }

  // Private methods for generating messages

  private generateAppointmentReminderMessage(patient: Patient, appointment: Appointment): string {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🦷 *Sai Dental Care - Appointment Reminder*

Hello ${patient.firstName},

This is a friendly reminder about your upcoming dental appointment:

📅 *Date:* ${appointmentDate}
🕐 *Time:* ${appointment.startTime}
👨‍⚕️ *Doctor:* ${appointment.doctorName}
🏥 *Treatment:* ${appointment.type}

📍 *Clinic Address:*
Sai Dental Care
[Your Clinic Address]

⚠️ *Please Note:*
- Arrive 10 minutes early
- Bring your ID and insurance cards
- If you need to reschedule, please call us at least 24 hours in advance

If you have any questions, feel free to reply to this message or call us.

Thank you!
*Sai Dental Care Team*`;
  }

  private generateAppointmentConfirmationMessage(patient: Patient, appointment: Appointment): string {
    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `✅ *Appointment Confirmed - Sai Dental Care*

Hello ${patient.firstName},

Your appointment has been successfully scheduled:

📅 *Date:* ${appointmentDate}
🕐 *Time:* ${appointment.startTime}
👨‍⚕️ *Doctor:* ${appointment.doctorName}
🏥 *Treatment:* ${appointment.type}

We look forward to seeing you!

*Sai Dental Care Team*`;
  }

  private generateBillNotificationMessage(patient: Patient, bill: Bill): string {
    return `💳 *Bill Generated - Sai Dental Care*

Hello ${patient.firstName},

Your bill has been generated:

🧾 *Bill Number:* ${bill.billNumber}
📅 *Date:* ${new Date(bill.issueDate).toLocaleDateString('en-IN')}
💰 *Total Amount:* ₹${bill.total.toFixed(2)}
📅 *Due Date:* ${new Date(bill.dueDate).toLocaleDateString('en-IN')}

You can make payment at our clinic or through online banking.

For any queries, please contact us.

Thank you!
*Sai Dental Care Team*`;
  }

  private generatePaymentConfirmationMessage(patient: Patient, bill: Bill, amount: number): string {
    return `✅ *Payment Received - Sai Dental Care*

Hello ${patient.firstName},

We have received your payment:

💰 *Amount Received:* ₹${amount.toFixed(2)}
🧾 *Bill Number:* ${bill.billNumber}
📅 *Payment Date:* ${new Date().toLocaleDateString('en-IN')}

Thank you for your payment!

*Sai Dental Care Team*`;
  }

  private generateWelcomeMessage(patient: Patient): string {
    return `🦷 *Welcome to Sai Dental Care!*

Hello ${patient.firstName},

Welcome to our dental family! We're excited to take care of your oral health.

🏥 *Our Services:*
- General Dentistry
- Cosmetic Dentistry  
- Orthodontics
- Oral Surgery
- Preventive Care

📞 *Contact Us:*
- Phone: [Your Phone Number]
- Email: [Your Email]
- Address: [Your Address]

💡 *Tips for Healthy Teeth:*
- Brush twice daily
- Floss regularly
- Visit us every 6 months

We look forward to providing you with excellent dental care!

*Sai Dental Care Team*`;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation for phone numbers
    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Format phone number for WhatsApp (ensure it has country code)
   */
  formatPhoneForWhatsApp(phoneNumber: string): string {
    let cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // If number starts with 0, replace with +91 (India)
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+91' + cleanPhone.substring(1);
    }
    
    // If number doesn't start with +, add +91 (India)
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+91' + cleanPhone;
    }
    
    return cleanPhone;
  }
}
