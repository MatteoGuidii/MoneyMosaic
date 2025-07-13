// Re-export from the new modular bank service
export * from './bank';
export { bankService } from './bank';

// For backward compatibility, also export as default
export { bankService as default } from './bank';
