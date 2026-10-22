// Compatibility export; one canonical workspace email dataset.
import { mockEmails, resolveEmailId } from './mockEmails.js';
export { mockEmails as emails } from './mockEmails.js';
export const getEmail = (id) => mockEmails.find((email) => email.id === resolveEmailId(id));
