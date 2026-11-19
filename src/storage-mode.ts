export type StorageMode = 'mock' | 'live';

export interface StorageInfo {
  storage: StorageMode;
  label: string;
}

export type GeminiMode = 'off' | 'mock' | 'live';

export interface OperationsInfo extends StorageInfo {
  gemini_mode: GeminiMode;
  gemini_label: string;
}

export function getStorageInfo(): StorageInfo {
  if (process.env.STORAGE_MODE === 'live') {
    return {
      storage: 'live',
      label: '\u0047\u006f\u006f\u0067\u006c\u0065 \uC2DC\uD2B8\u00B7\uB4DC\uB77C\uC774\uBE0C(live)',
    };
  }

  return {
    storage: 'mock',
    label: '\uB0B4 \uCEF4\uD4E8\uD130(mock)',
  };
}

export function getGeminiInfo(): Pick<OperationsInfo, 'gemini_mode' | 'gemini_label'> {
  const storage = getStorageInfo().storage;
  const configuredMode = process.env.GEMINI_MODE;
  const mode: GeminiMode = configuredMode
    ? (configuredMode as GeminiMode)
    : storage === 'live'
      ? 'live'
      : 'off';
  const labels: Record<GeminiMode, string> = {
    off: '\uAFB8\uC9D0(off)',
    mock: '\uC5F0\uC2B5\uC6A9(mock)',
    live: '\uC2E4\uC81C Gemini(live)',
  };

  return { gemini_mode: mode, gemini_label: labels[mode] };
}

export function validateGeminiMode(): void {
  const storage = getStorageInfo().storage;
  const mode = process.env.GEMINI_MODE;
  const resolvedMode = mode || (storage === 'live' ? 'live' : 'off');
  const validModes = ['off', 'mock', 'live'];
  const compatible =
    resolvedMode === 'off' ||
    (storage === 'mock' && resolvedMode === 'mock') ||
    (storage === 'live' && resolvedMode === 'live');

  if (!validModes.includes(resolvedMode) || !compatible) {
    throw new Error(
      'GEMINI_MODE \uC124\uC815\uC744 \uD655\uC778\uD558\uC138\uC694. STORAGE_MODE=mock\uC5D0\uB294 off \uB610\uB294 mock, STORAGE_MODE=live\uC5D0\uB294 off \uB610\uB294 live\uB97C \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    );
  }
}

export function getOperationsInfo(): OperationsInfo {
  return { ...getStorageInfo(), ...getGeminiInfo() };
}