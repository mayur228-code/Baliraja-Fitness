import { getAppBaseUrl } from './qrPayload';

/**
 * Baliraja Fitness App Configuration & Distribution Settings
 */

export interface AppReleaseMetadata {
  version: string;
  versionCode: number;
  releaseDate: string;
  apkFileName: string;
  apkFileSize: string;
  minAndroidVersion: string;
  targetAndroidVersion: string;
  appNameMarathi: string;
  appNameEnglish: string;
  coachName: string;
  coachPhone: string;
  coachAddress: string;
}

export const DEFAULT_APP_METADATA: AppReleaseMetadata = {
  version: '1.0.3',
  versionCode: 4,
  releaseDate: 'ऑक्टोबर २०२६ (October 2026)',
  apkFileName: 'app-release.apk',
  apkFileSize: '29.8 MB',
  minAndroidVersion: 'Android 7.0+ (Nougat / API 24+)',
  targetAndroidVersion: 'Android 14 / 15 (API 34/36)',
  appNameMarathi: 'बळीराजा फिटनेस',
  appNameEnglish: 'Baliraja Fitness',
  coachName: 'श्री. गणेश शिंदे',
  coachPhone: '7972532010',
  coachAddress: 'स्वामी विवेकानंद इंग्लिश स्कूल जवळ, लाईट ऑफिस शेजारी, धारूर रोड, केज',
};

export const DEFAULT_GITHUB_RELEASE_APK_URL =
  'https://github.com/mayur228-code/Baliraja-Fitness/releases/latest/download/app-release.apk';

/**
 * Get the APK download URL.
 * Hierarchy:
 * 1. import.meta.env.VITE_APK_DOWNLOAD_URL (environment variable)
 * 2. window.__BALIRAJA_APK_URL__ (runtime dynamic window injection)
 * 3. Default GitHub Release APK download URL
 */
export function getApkDownloadUrl(): string {
  const envUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_APK_DOWNLOAD_URL : undefined;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  if (typeof window !== 'undefined' && (window as any).__BALIRAJA_APK_URL__) {
    const windowUrl = (window as any).__BALIRAJA_APK_URL__;
    if (typeof windowUrl === 'string' && windowUrl.trim().length > 0) {
      return windowUrl.trim();
    }
  }

  // Default to GitHub Release asset URL
  return DEFAULT_GITHUB_RELEASE_APK_URL;
}

/**
 * Get the canonical /download page URL dynamically from the current host/window
 */
export function getCanonicalDownloadPageUrl(): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/download`;
}

/**
 * Retrieve active metadata merged with environment overrides
 */
export function getAppMetadata(): AppReleaseMetadata {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

  return {
    version: metaEnv?.VITE_APP_VERSION || DEFAULT_APP_METADATA.version,
    versionCode: Number(metaEnv?.VITE_APP_VERSION_CODE) || DEFAULT_APP_METADATA.versionCode,
    releaseDate: metaEnv?.VITE_APP_RELEASE_DATE || DEFAULT_APP_METADATA.releaseDate,
    apkFileName: metaEnv?.VITE_APK_FILE_NAME || DEFAULT_APP_METADATA.apkFileName,
    apkFileSize: metaEnv?.VITE_APK_FILE_SIZE || DEFAULT_APP_METADATA.apkFileSize,
    minAndroidVersion: DEFAULT_APP_METADATA.minAndroidVersion,
    targetAndroidVersion: DEFAULT_APP_METADATA.targetAndroidVersion,
    appNameMarathi: DEFAULT_APP_METADATA.appNameMarathi,
    appNameEnglish: DEFAULT_APP_METADATA.appNameEnglish,
    coachName: DEFAULT_APP_METADATA.coachName,
    coachPhone: DEFAULT_APP_METADATA.coachPhone,
    coachAddress: DEFAULT_APP_METADATA.coachAddress,
  };
}
