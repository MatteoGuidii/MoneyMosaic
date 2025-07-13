// Re-export from the new modular investment service
export * from './investment';
export { investmentService } from './investment';

// For backward compatibility, also export as default
export { investmentService as default } from './investment';