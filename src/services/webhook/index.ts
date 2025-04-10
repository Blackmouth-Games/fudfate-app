
// Re-export everything from the individual modules
export * from './logger';
export * from './core';
export * from './reading';
export * from './deck';

// Add a note about the refactoring
/**
 * Webhook Service
 * 
 * This service has been refactored into multiple smaller modules:
 * - logger.ts: Handles logging of webhook calls
 * - core.ts: Provides base webhook functionality
 * - reading.ts: Handles reading webhook calls
 * - deck.ts: Handles deck selection webhook calls
 */
