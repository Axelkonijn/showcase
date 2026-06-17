export interface ContactFormData {
  firstName: string;   // Max 60 chars
  lastName: string;    // Max 60 chars
  email: string;       // Max 80 chars, must be valid email format
  phone: string;       // Max 20 chars
  subject: string;     // Max 200 chars
  message: string;     // Max 600 chars

  captchaNumA: number;
  captchaNumB: number;
  captchaAnswer: string;
}

export interface ContactMessage {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    subject: string;
    email: string;      // Dit is de ontsleutelde versie
    phone: string;      // Dit is de ontsleutelde versie
    messageText: string;
    createdAt: string;  // Datums komen als string binnen via JSON
}