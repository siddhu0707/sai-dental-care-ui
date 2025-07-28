import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

export type SupportedLanguage = 'en' | 'mr';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Record<SupportedLanguage, TranslationData> = {
    en: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        add: 'Add',
        update: 'Update',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        time: 'Time',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        notes: 'Notes',
        total: 'Total',
        amount: 'Amount',
        payment: 'Payment',
        bill: 'Bill',
        invoice: 'Invoice',
        download: 'Download',
        print: 'Print',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        all: 'All',
        recent: 'Recent',
        lastVisit: 'Last visit',
        noAppointments: 'No appointments scheduled for today',
        quickActions: 'Quick Actions',
        paid: 'Paid',
        billed: 'Billed'
      },
      nav: {
        dashboard: 'Dashboard',
        patients: 'Patients',
        appointments: 'Appointments',
        billing: 'Billing',
        reports: 'Reports',
        settings: 'Settings'
      },
      clinic: {
        name: 'Sai Dental Care',
        subtitle: 'Management System',
        address: '123 Main Street, City, State 12345',
        phone: 'Phone: (555) 123-4567'
      },
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of clinic operations',
        todayAppointments: 'Today\'s Appointments',
        totalPatients: 'Total Patients',
        monthlyRevenue: 'Monthly Revenue',
        pendingBills: 'Pending Bills',
        recentActivity: 'Recent Activity',
        upcomingAppointments: 'Upcoming Appointments',
        patientOverview: 'Patient Overview',
        quickActions: 'Quick Actions',
        scheduleAppointment: 'Schedule Appointment',
        addPatient: 'Add Patient',
        createBill: 'Create Bill',
        allPaid: 'All patients have paid their bills!',
        alerts: 'Alerts & Notifications'
      },
      patients: {
        title: 'Patient Management',
        subtitle: 'Manage patient records and information',
        addNew: 'Add New Patient',
        firstName: 'First Name',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        emergencyContact: 'Emergency Contact',
        relationship: 'Relationship',
        medicalHistory: 'Medical History',
        allergies: 'Allergies',
        totalVisits: 'Total Visits',
        lastVisit: 'Last Visit',
        nextAppointment: 'Next Appointment',
        registrationDate: 'Registration Date',
        contactInfo: 'Contact Information',
        address: {
          street: 'Street Address',
          city: 'City',
          state: 'State',
          zipCode: 'ZIP Code'
        },
        searchPlaceholder: 'Search patients by name, email, or phone...',
        noPatients: 'No patients found',
        patientDetails: 'Patient Details',
        visitInfo: 'Visit Information',
        sortByName: 'Sort by Name',
        sortByDate: 'Sort by Registration Date',
        sortByLastVisit: 'Sort by Last Visit',
        adjustSearch: 'Try adjusting your search criteria',
        addFirstPatient: 'Start by adding your first patient',
        editPatient: 'Edit Patient',
        selectRelationship: 'Select relationship',
        relationships: {
          spouse: 'Spouse',
          parent: 'Parent',
          child: 'Child',
          sibling: 'Sibling',
          friend: 'Friend',
          other: 'Other'
        },
        medicalInfo: 'Medical Information',
        commaSeparated: 'comma-separated',
        medicalHistoryPlaceholder: 'e.g., Hypertension, Diabetes, Heart Disease',
        allergiesPlaceholder: 'e.g., Penicillin, Latex, Shellfish',
        notesPlaceholder: 'Additional notes about the patient',
        addPatient: 'Add Patient',
        updatePatient: 'Update Patient',
        patientId: 'Patient ID',
        registered: 'Registered',
        noMedicalHistory: 'No medical history recorded',
        noAllergies: 'No allergies recorded',
        noVisits: 'No visits recorded'
      },
      appointments: {
        title: 'Appointment Management',
        subtitle: 'Schedule and manage patient appointments',
        schedule: 'Schedule Appointment',
        todaySchedule: 'Today\'s Schedule',
        allAppointments: 'All Appointments',
        calendarView: 'Calendar View',
        appointmentType: 'Appointment Type',
        duration: 'Duration',
        doctor: 'Doctor',
        patient: 'Patient',
        startTime: 'Start Time',
        endTime: 'End Time',
        status: {
          scheduled: 'Scheduled',
          confirmed: 'Confirmed',
          completed: 'Completed',
          cancelled: 'Cancelled',
          rescheduled: 'Rescheduled'
        },
        types: {
          cleaning: 'Cleaning',
          checkup: 'Check-up',
          filling: 'Filling',
          extraction: 'Extraction',
          rootCanal: 'Root Canal',
          crown: 'Crown',
          consultation: 'Consultation',
          followUp: 'Follow-up',
          emergency: 'Emergency'
        },
        reminder: 'Reminder',
        reminderSent: 'Reminder sent',
        sendReminder: 'Send Reminder',
        noAppointments: 'No appointments found',
        appointmentDetails: 'Appointment Details',
        complete: 'Complete',
        available: 'Available',
        searchByPatient: 'Search by patient name...',
        allStatuses: 'All Statuses',
        editAppointment: 'Edit Appointment',
        scheduleNew: 'Schedule New Appointment',
        selectPatient: 'Select Patient',
        selectType: 'Select Type',
        selectTime: 'Select Time',
        booked: 'Booked'
      },
      billing: {
        title: 'Billing & Payments',
        subtitle: 'Manage bills, payments, and invoices',
        createBill: 'Create New Bill',
        allBills: 'All Bills',
        payments: 'Payments',
        patientBalances: 'Patient Balances',
        serviceTemplates: 'Service Templates',
        billNumber: 'Bill Number',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        subtotal: 'Subtotal',
        tax: 'Tax',
        discount: 'Discount',
        monthlyRevenue: 'Monthly Revenue',
        outstandingAmount: 'Outstanding Amount',
        overdueBills: 'Overdue Bills',
        billItems: 'Bill Items',
        service: 'Service',
        category: 'Category',
        quantity: 'Quantity',
        unitPrice: 'Unit Price',
        paymentMethod: 'Payment Method',
        paymentMethods: {
          cash: 'Cash',
          creditCard: 'Credit Card',
          debitCard: 'Debit Card',
          check: 'Check',
          insurance: 'Insurance',
          bankTransfer: 'Bank Transfer'
        },
        status: {
          draft: 'Draft',
          sent: 'Sent',
          paid: 'Paid',
          overdue: 'Overdue',
          cancelled: 'Cancelled',
          partial: 'Partial'
        },
        noBills: 'No bills found',
        billDetails: 'Bill Details',
        recordPayment: 'Record Payment',
        markPaid: 'Mark as Paid',
        sendBill: 'Send Bill',
        pendingBills: 'Pending Bills'
      },
      validation: {
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        emailRequired: 'Email is required',
        emailValid: 'Please enter a valid email',
        phoneRequired: 'Phone is required',
        dateOfBirthRequired: 'Date of birth is required',
        patientRequired: 'Patient is required',
        appointmentTypeRequired: 'Appointment type is required',
        dateRequired: 'Date is required',
        timeRequired: 'Time is required',
        amountRequired: 'Amount is required'
      }
    },
    mr: {
      common: {
        save: 'जतन करा',
        cancel: 'रद्द करा',
        edit: 'संपादित करा',
        delete: 'हटवा',
        view: 'पहा',
        add: 'जोडा',
        update: 'सुधारणा करा',
        create: 'तयार करा',
        search: 'शोधा',
        filter: 'गाळणी',
        actions: 'कृती',
        status: 'स्थिती',
        date: 'दिनांक',
        time: 'वेळ',
        name: 'नाव',
        email: 'ईमेल',
        phone: 'फोन',
        address: 'पत्ता',
        notes: 'टिप्पण्या',
        total: 'एकूण',
        amount: 'रक्कम',
        payment: 'पेमेंट',
        bill: 'बिल',
        invoice: 'बीजक',
        download: 'डाउनलोड',
        print: 'प्रिंट',
        close: 'बंद करा',
        confirm: 'पुष्टी करा',
        yes: 'होय',
        no: 'नाही',
        loading: 'लोड होत आहे...',
        error: 'त्रुटी',
        success: 'यशस्वी',
        warning: 'चेतावणी',
        info: 'माहिती',
        all: 'सर्व',
        recent: 'नुकतेच',
        lastVisit: 'शेवटची भेट',
        noAppointments: 'आजसाठी कोणत्याही भेटी नियोजित नाहीत',
        quickActions: 'द्रुत कृती',
        paid: 'भरले',
        billed: 'बिल केले'
      },
      nav: {
        dashboard: 'डॅशबोर्ड',
        patients: 'रुग्ण',
        appointments: 'भेटी',
        billing: 'बिलिंग',
        reports: 'अहवाल',
        settings: 'सेटिंग्ज'
      },
      clinic: {
        name: 'साई डेंटल केअर',
        subtitle: 'व्यवस्थापन प्रणाली',
        address: '१२३ मुख्य रस्ता, शहर, राज्य १२३४५',
        phone: 'फोन: (५५५) १२३-४५६���'
      },
      dashboard: {
        title: 'डॅशबोर्ड',
        subtitle: 'क्लिनिक कार्यांचे विहंगावलोकन',
        todayAppointments: 'आजच्या भेटी',
        totalPatients: 'एकूण रुग्ण',
        monthlyRevenue: 'मासिक कमाई',
        pendingBills: 'प्रलंबित बिले',
        recentActivity: 'नुकतीच कार्यावली',
        upcomingAppointments: 'आगामी भेटी',
        patientOverview: 'रुग्ण विहंगावलोकन',
        quickActions: 'द्रुत कृती',
        scheduleAppointment: 'भेट नियोजित करा',
        addPatient: 'रुग्ण जोडा',
        createBill: 'बिल तयार करा',
        allPaid: 'सर्व रुग्णांनी त्यांची बिले भरली आहेत!',
        alerts: 'इशारे आणि सूचना'
      },
      patients: {
        title: 'रुग्ण व्यवस्थापन',
        subtitle: 'रुग्णांचे रेकॉर्ड आणि माहिती व्यवस्थापित करा',
        addNew: 'नवीन रुग्ण जोडा',
        firstName: 'नाव',
        lastName: 'आडनाव',
        dateOfBirth: 'जन्म तारीख',
        gender: 'लिंग',
        male: 'पुरुष',
        female: 'स्त्री',
        emergencyContact: 'आपत्���ालीन संपर्क',
        relationship: 'नाते',
        medicalHistory: 'वैद्यकीय इतिहास',
        allergies: 'ऍलर्जी',
        totalVisits: 'एकूण भेटी',
        lastVisit: 'शेवटची भेट',
        nextAppointment: 'पुढील भेट',
        registrationDate: 'नोंदणी दिनांक',
        contactInfo: 'संपर्क माहिती',
        address: {
          street: 'रस्त्याचा पत्ता',
          city: 'शहर',
          state: 'राज्य',
          zipCode: 'पिन कोड'
        },
        searchPlaceholder: 'नाव, ईमेल किंवा फोन नंबरवरून रुग्ण शोधा...',
        noPatients: 'कोणतेही रुग्ण सापडले नाहीत',
        patientDetails: 'रुग्णाचे तपशील',
        visitInfo: 'भेटीची माहिती',
        sortByName: 'नावानुसार क्रमवारी लावा',
        sortByDate: 'नोंदणी दिनांकानुसार क्रमवारी लावा',
        sortByLastVisit: 'शेवटच्या भेटीनुसार क्रमवारी लावा',
        adjustSearch: 'आपले शोध निकष समायोजित करण्याचा प्रयत्न करा',
        addFirstPatient: 'आपला पहिला रुग्ण जोडून सुरुवात करा',
        editPatient: 'रुग्ण संपादित करा',
        selectRelationship: 'नाते निवडा',
        relationships: {
          spouse: 'जोडीदार',
          parent: 'पालक',
          child: 'मूल',
          sibling: 'भावंड',
          friend: 'मित्र',
          other: 'इतर'
        },
        medicalInfo: 'वैद्यकीय माहिती',
        commaSeparated: 'स्वल्पविरामने विभक्त',
        medicalHistoryPlaceholder: 'उदा., उच्च रक्तदाब, मधुमेह, हृदयरोग',
        allergiesPlaceholder: 'उदा., पेनिसिलिन, लेटेक्स, शेलफिश',
        notesPlaceholder: 'रुग्णाबद्दल अतिरिक्त टिप्पण्या',
        addPatient: 'रुग्ण जोडा',
        updatePatient: 'रुग्ण अपडेट करा',
        patientId: 'रुग्ण आयडी',
        registered: 'नोंदणीकृत',
        noMedicalHistory: 'कोणताही वैद्यकीय इतिहास नोंदविला नाही',
        noAllergies: 'कोणत्या ऍलर्जी नोंदविल्या नाहीत',
        noVisits: 'कोणत्या भेटी नोंदविल्या नाहीत'
      },
      appointments: {
        title: 'भेट व्यवस्थापन',
        subtitle: 'रुग्णांच्या भेटी नियोजित आणि व्यवस्थापित करा',
        schedule: 'भेट नियोजित करा',
        todaySchedule: 'आजचे वेळापत्रक',
        allAppointments: 'सर्व भेटी',
        calendarView: 'कॅलेंडर दृश्य',
        appointmentType: 'भेटीचा प्रकार',
        duration: 'कालावधी',
        doctor: 'डॉक्टर',
        patient: 'रुग्ण',
        startTime: 'सुरुवा��ीची वेळ',
        endTime: 'समाप्तीची वेळ',
        status: {
          scheduled: 'नियोजित',
          confirmed: 'पुष्ट',
          completed: 'पूर्ण',
          cancelled: 'रद्द',
          rescheduled: 'पुन्हा नियोजित'
        },
        types: {
          cleaning: 'सफाई',
          checkup: 'तपासणी',
          filling: 'भरणे',
          extraction: 'काढणे',
          rootCanal: 'रूट कॅनाल',
          crown: 'मुकुट',
          consultation: 'सल्लामसलत',
          followUp: 'फॉलो-अप',
          emergency: 'आपत्कालीन'
        },
        reminder: 'स्मरणपत्र',
        reminderSent: 'स्मरणपत्र पाठवले',
        sendReminder: 'स्मरणपत्र पाठवा',
        noAppointments: 'कोणत्याही भेटी सापडल्या नाहीत',
        appointmentDetails: 'भेटीचे तपशील',
        complete: 'पूर्ण करा',
        available: 'उपलब्ध',
        searchByPatient: 'रुग्णाच्या नावाने शोधा...',
        allStatuses: 'सर्व स्थिती',
        editAppointment: 'भेट संपादित करा',
        scheduleNew: 'नवीन भेट नियोजित करा',
        selectPatient: 'रुग्ण निवडा',
        selectType: 'प्रकार निवडा',
        selectTime: 'वेळ निवडा',
        booked: 'बुक केलेले'
      },
      billing: {
        title: 'बिलिंग आणि पेमेंट',
        subtitle: 'बिले, पेमेंट आणि बीजक व्यवस्थापित करा',
        createBill: 'नवीन बिल तयार करा',
        allBills: 'सर्व बिले',
        payments: 'पेमेंट्स',
        patientBalances: 'रुग्णांची शिल्लक',
        serviceTemplates: 'सेवा टेम्प्लेट्स',
        billNumber: 'बिल क्रमांक',
        issueDate: 'जारी दिनांक',
        dueDate: 'देय दिनांक',
        subtotal: 'उपएकूण',
        tax: 'कर',
        discount: 'सूट',
        monthlyRevenue: 'मासिक कमाई',
        outstandingAmount: 'थकित रक्कम',
        overdueBills: 'मुदत संपलेली बिले',
        billItems: 'बिल आयटम',
        service: 'सेवा',
        category: 'श्रेणी',
        quantity: 'प्रमाण',
        unitPrice: 'प्रति युनिट किंमत',
        paymentMethod: 'पेमेंट पद्धत',
        paymentMethods: {
          cash: 'रोख',
          creditCard: 'क्रेडिट कार्ड',
          debitCard: 'डेबिट कार्ड',
          check: 'चेक',
          insurance: 'विमा',
          bankTransfer: 'बँक ट्रान्सफर'
        },
        status: {
          draft: 'मसुदा',
          sent: 'पाठवले',
          paid: 'भरले',
          overdue: 'मुदत संपली',
          cancelled: 'रद्द',
          partial: 'अर्धवट'
        },
        noBills: 'कोणतीही बिले सापडली नाहीत',
        billDetails: 'बिलाचे तपशील',
        recordPayment: 'पेमेंट नोंदवा',
        markPaid: 'भरले म्हणून चिन्हांकित करा',
        sendBill: 'बिल पाठवा',
        pendingBills: 'प्रलंबित बिले'
      },
      validation: {
        firstNameRequired: 'नाव आवश्यक आहे',
        lastNameRequired: 'आडनाव आवश्यक आहे',
        emailRequired: 'ईमेल आवश्यक आहे',
        emailValid: 'कृपया वैध ईमेल प्रविष्ट करा',
        phoneRequired: 'फोन आवश्यक आहे',
        dateOfBirthRequired: 'जन्म तारीख आवश्यक आहे',
        patientRequired: 'रुग्ण आवश्यक आहे',
        appointmentTypeRequired: 'भेटीचा प्रकार आवश्यक आहे',
        dateRequired: 'दिनांक आवश्यक आहे',
        timeRequired: 'वेळ आवश्यक आहे',
        amountRequired: 'रक्कम आवश्यक आहे'
      }
    }
  };

  constructor() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('selectedLanguage') as SupportedLanguage;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'mr')) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', language);
  }

  translate(key: string): string {
    const language = this.getCurrentLanguage();
    const keys = key.split('.');
    let value: any = this.translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = this.translations['en'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key itself if not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  getTranslations(language?: SupportedLanguage): TranslationData {
    return this.translations[language || this.getCurrentLanguage()];
  }
}
