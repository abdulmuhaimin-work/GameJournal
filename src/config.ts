/**
 * Edit mode: only in development (you edit locally).
 * View mode: in production build (visitors see read-only journal from journal.json).
 */
export const isEditMode = import.meta.env.DEV;
