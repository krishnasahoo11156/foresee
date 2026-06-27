// Gemini API keys rotation config
const GEMINI_API_KEYS = [
  "AQ.Ab8RN6K_RhKazl1E4nqeHqjti6hfkUF2gH8_zPkMg4naa8cvMw", // Key 1
  "AQ.Ab8RN6JXDBl41Wfu_T83Fde7wzHKUEMzPmqc5FKSb5OP_K4uaw", // Key 2
  "AQ.Ab8RN6IK4NHznhWthXns47gUR4OzI3ua8gTRXIch_lB_eft3pQ"  // Key 3
];

let activeKeyIndex = 0;

/**
 * Returns the currently active Gemini API key.
 */
export function getActiveApiKey(): string {
  return GEMINI_API_KEYS[activeKeyIndex];
}

/**
 * Rotates to the next fallback Gemini API key.
 * Returns true if rotation was successful, or false if all keys have been exhausted.
 */
export function rotateApiKey(): boolean {
  if (activeKeyIndex < GEMINI_API_KEYS.length - 1) {
    activeKeyIndex++;
    console.warn(`Gemini API Key failed. Rotating to fallback key index: ${activeKeyIndex}`);
    return true;
  }
  console.error("All Gemini API keys have been exhausted!");
  return false;
}

/**
 * Resets the key index back to the primary key.
 */
export function resetApiKeyIndex(): void {
  activeKeyIndex = 0;
}
