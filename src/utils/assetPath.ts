/**
 * Universal Asset URL Resolver for Baliraja Fitness
 *
 * Resolves static asset paths (images, PDF templates, icons) to their correct URLs
 * across all deployment targets:
 * 1. Native Capacitor Android app (root / or https://localhost/)
 * 2. GitHub Pages (/Baliraja-Fitness/)
 * 3. Local Vite dev / preview server
 * 4. Custom domain / subpath deployments
 */
export function resolveAssetUrl(assetPath: string): string {
  if (!assetPath) return '';

  // Return unchanged if already a full URL, Data URL, or Blob URL
  if (
    assetPath.startsWith('data:') ||
    assetPath.startsWith('blob:') ||
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://')
  ) {
    return assetPath;
  }

  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;

  // 1. Check Vite's configured BASE_URL at build time
  const viteBase = typeof import.meta !== 'undefined' ? (import.meta as any).env?.BASE_URL : undefined;
  if (viteBase && viteBase !== '/' && viteBase !== './') {
    const normalizedViteBase = viteBase.endsWith('/') ? viteBase : `${viteBase}/`;
    return `${normalizedViteBase}${cleanPath}`;
  }

  // 2. Runtime detection for GitHub Pages subpath hosting (/Baliraja-Fitness/...)
  if (typeof window !== 'undefined' && window.location) {
    const pathname = window.location.pathname || '';
    if (pathname.startsWith('/Baliraja-Fitness/') || pathname === '/Baliraja-Fitness') {
      return `/Baliraja-Fitness/${cleanPath}`;
    }
  }

  // 3. Native Android app / root deployment default
  return `/${cleanPath}`;
}
