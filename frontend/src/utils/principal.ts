import { Principal } from '@dfinity/principal';

export interface PrincipalParseResult {
  success: boolean;
  principal?: Principal;
  error?: string;
}

export function parsePrincipal(text: string): PrincipalParseResult {
  if (!text || !text.trim()) {
    return {
      success: false,
      error: 'Principal ID cannot be empty',
    };
  }

  try {
    const principal = Principal.fromText(text.trim());
    return {
      success: true,
      principal,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid Principal ID format. Please check and try again.',
    };
  }
}
