import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { DEFAULT_APP_METADATA } from './appConfig';

export interface AppUpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName?: string;
  releaseNotes?: string;
  releaseUrl: string;
  apkDownloadUrl: string;
  publishedAt?: string;
}

export const GITHUB_REPO_OWNER = 'mayur228-code';
export const GITHUB_REPO_NAME = 'Baliraja-Fitness';
export const GITHUB_LATEST_RELEASE_API = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
export const GITHUB_LATEST_RELEASE_PAGE = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;

/**
 * Strips leading 'v' and cleans whitespace from version string
 */
export function cleanVersionString(v: string): string {
  if (!v) return '0.0.0';
  return v.replace(/^v/i, '').trim();
}

/**
 * Returns true if candidate version is strictly greater than current version
 */
export function isVersionNewer(candidateVersion: string, currentVersion: string): boolean {
  const cleanCandidate = cleanVersionString(candidateVersion);
  const cleanCurrent = cleanVersionString(currentVersion);

  const candParts = cleanCandidate.split('.').map((n) => parseInt(n, 10) || 0);
  const currParts = cleanCurrent.split('.').map((n) => parseInt(n, 10) || 0);

  const length = Math.max(candParts.length, currParts.length, 3);
  for (let i = 0; i < length; i++) {
    const candNum = candParts[i] || 0;
    const currNum = currParts[i] || 0;
    if (candNum > currNum) return true;
    if (candNum < currNum) return false;
  }
  return false;
}

/**
 * Retrieves the currently installed application version from Capacitor or configuration
 */
export async function getCurrentAppVersion(): Promise<string> {
  try {
    if (Capacitor.isNativePlatform()) {
      const info = await CapApp.getInfo();
      if (info && info.version) {
        return cleanVersionString(info.version);
      }
    }
  } catch (e) {
    // Fallback if native call fails
  }

  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  return cleanVersionString(metaEnv?.VITE_APP_VERSION || DEFAULT_APP_METADATA.version);
}

/**
 * Silently checks the GitHub Releases API for the latest version.
 * Handles offline/network errors silently without throwing.
 */
export async function checkForAppUpdate(timeoutMs = 6000): Promise<AppUpdateCheckResult> {
  const currentVersion = await getCurrentAppVersion();

  const defaultResult: AppUpdateCheckResult = {
    hasUpdate: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseUrl: GITHUB_LATEST_RELEASE_PAGE,
    apkDownloadUrl: GITHUB_LATEST_RELEASE_PAGE,
  };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    const response = await fetch(GITHUB_LATEST_RELEASE_API, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller?.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      // 404 (no release yet), 403 (rate limited), etc. - fail silently
      return defaultResult;
    }

    const releaseData = await response.json();
    if (!releaseData) return defaultResult;

    const rawTag = releaseData.tag_name || releaseData.name || '';
    const latestVersion = cleanVersionString(rawTag);

    if (!latestVersion) return defaultResult;

    const hasUpdate = isVersionNewer(latestVersion, currentVersion);

    // Look for direct APK asset in release assets list
    let apkDownloadUrl = GITHUB_LATEST_RELEASE_PAGE;
    if (Array.isArray(releaseData.assets) && releaseData.assets.length > 0) {
      const apkAsset = releaseData.assets.find(
        (asset: any) => asset.name && asset.name.toLowerCase().endsWith('.apk')
      );
      if (apkAsset && apkAsset.browser_download_url) {
        apkDownloadUrl = apkAsset.browser_download_url;
      }
    }

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseName: releaseData.name || `Baliraja Fitness v${latestVersion}`,
      releaseNotes: releaseData.body || undefined,
      releaseUrl: releaseData.html_url || GITHUB_LATEST_RELEASE_PAGE,
      apkDownloadUrl,
      publishedAt: releaseData.published_at || undefined,
    };
  } catch (error) {
    // Network offline / abort / DNS failure - fail silently
    return defaultResult;
  }
}
