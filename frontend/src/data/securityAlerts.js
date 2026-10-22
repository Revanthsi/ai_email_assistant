import { mockEmails } from './mockEmails.js';
export const securityAlerts = mockEmails.filter((email) => email.riskLevel !== 'low');
