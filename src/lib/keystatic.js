import { storage } from '../../keystatic.config';

// Local mode writes straight to disk and has no authentication of its own.
export const panelEnabled = storage.kind === 'github' || process.env.NODE_ENV === 'development';
