import { Capacitor, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Interface for our native Android PdfViewer plugin
interface NativePdfViewerPlugin {
  openPdf(options: { path: string; title?: string }): Promise<{ success: boolean; uri?: string }>;
}

const PdfViewer = registerPlugin<NativePdfViewerPlugin>('PdfViewer');

/**
 * Convert a Blob into base64 string without data URL prefix
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a Uint8Array into base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Get sanitized PDF filename using client's name (e.g. Rahul_Patil.pdf)
 */
export function getSafePdfFileName(clientName?: string): string {
  const clean = (clientName || 'Report')
    .trim()
    .replace(/[/\\?%*:|"<>]+/g, '')
    .replace(/\s+/g, '_');
  return `${clean || 'Report'}.pdf`;
}

/**
 * Save PDF to local device storage (Documents on Android / Download in browser)
 */
export async function savePdfToDevice(
  pdfBlobOrBytes: Blob | Uint8Array,
  fileName: string
): Promise<{ success: boolean; filePath?: string; uri?: string; message: string }> {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const base64Data =
        pdfBlobOrBytes instanceof Blob
          ? await blobToBase64(pdfBlobOrBytes)
          : uint8ArrayToBase64(pdfBlobOrBytes);

      // Save in Documents directory
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      // Also ensure a copy exists in Cache directory for fast sharing/opening
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      }).catch((e) => console.warn('[nativePdfHandler] Cache mirror write notice:', e));

      return {
        success: true,
        filePath: fileName,
        uri: result.uri,
        message: `PDF यशस्वीरीत्या जतन झाली (Documents/${fileName})!`,
      };
    } else {
      // Standard browser download
      const blob =
        pdfBlobOrBytes instanceof Blob
          ? pdfBlobOrBytes
          : new Blob([pdfBlobOrBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 30000);

      return {
        success: true,
        filePath: fileName,
        message: 'PDF यशस्वीरीत्या डाऊनलोड झाली (PDF Downloaded)!',
      };
    }
  } catch (err: any) {
    console.error('[nativePdfHandler] savePdfToDevice error:', err);
    throw new Error(err.message || 'PDF जतन करताना त्रुटी आली.');
  }
}

/**
 * Open / View PDF reliably across Native Android (ACTION_VIEW Intent) and Web Browser
 */
export async function openPdfDocument(
  pdfBlobOrBytes: Blob | Uint8Array,
  fileName: string,
  fallbackBlobUrl?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const base64Data =
        pdfBlobOrBytes instanceof Blob
          ? await blobToBase64(pdfBlobOrBytes)
          : uint8ArrayToBase64(pdfBlobOrBytes);

      // 1. Write file to Cache directory for instant FileProvider resolution
      const cacheResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      // 2. Open via native PdfViewer plugin
      try {
        await PdfViewer.openPdf({
          path: cacheResult.uri,
          title: 'अहवाल PDF उघडा (Open Report PDF)',
        });
        return { success: true, message: 'PDF उघडली आहे.' };
      } catch (pluginErr: any) {
        console.warn('[nativePdfHandler] Native PdfViewer plugin call failed, trying Share fallback:', pluginErr);
        // Fallback: Open Android system chooser via Share plugin
        await Share.share({
          title: 'बळीराजा फिटनेस - अहवाल PDF',
          url: cacheResult.uri,
          dialogTitle: 'PDF उघडा किंवा शेअर करा (Open/Share PDF)',
        });
        return { success: true, message: 'PDF उघडण्यासाठी ॲप निवडा.' };
      }
    } else {
      // Browser environment
      let url = fallbackBlobUrl;
      if (!url) {
        const blob =
          pdfBlobOrBytes instanceof Blob
            ? pdfBlobOrBytes
            : new Blob([pdfBlobOrBytes as unknown as BlobPart], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
      }
      const win = window.open(url, '_blank');
      if (!win) {
        // Popup blocked, fallback to download
        await savePdfToDevice(pdfBlobOrBytes, fileName);
      }
      return { success: true, message: 'PDF नवीन टॅबमध्ये उघडली.' };
    }
  } catch (err: any) {
    console.error('[nativePdfHandler] openPdfDocument error:', err);
    throw new Error(err.message || 'PDF उघडताना त्रुटी आली.');
  }
}

/**
 * Share PDF file directly (via Android native Share Sheet or Web Share API)
 */
export async function sharePdfFile(
  pdfBlobOrBytes: Blob | Uint8Array,
  fileName: string,
  shareTitle: string,
  shareText: string,
  shareUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const base64Data =
        pdfBlobOrBytes instanceof Blob
          ? await blobToBase64(pdfBlobOrBytes)
          : uint8ArrayToBase64(pdfBlobOrBytes);

      // Save to cache
      const cacheResult = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      // Native Capacitor Share with actual file URI
      await Share.share({
        title: shareTitle,
        text: shareText,
        url: cacheResult.uri,
        dialogTitle: 'अहवाल PDF शेअर करा (Share PDF Report)',
      });

      return { success: true, message: 'PDF यशस्वीरीत्या शेअर केली!' };
    } else {
      const blob =
        pdfBlobOrBytes instanceof Blob
          ? pdfBlobOrBytes
          : new Blob([pdfBlobOrBytes as unknown as BlobPart], { type: 'application/pdf' });
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: shareTitle,
          text: shareText,
        });
        return { success: true, message: 'फाइल यशस्वीरीत्या शेअर केली (PDF Shared)!' };
      }

      // Web fallback: download file and open WhatsApp web
      await savePdfToDevice(blob, fileName);
      const whatsappText = `${shareText}\n\n(PDF अहवाल डाउनलोड झाला आहे. कृपया डाऊनलोड केलेली PDF फाईल सोबत जोडावी.)${shareUrl ? `\nऑनलाईन अहवाल लिंक: ${shareUrl}` : ''}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`, '_blank');
      return { success: true, message: 'PDF डाउनलोड झाली आहे. WhatsApp वर जोडून पाठवा.' };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: true, message: 'शेअरिंग रद्द केले.' };
    }
    console.error('[nativePdfHandler] sharePdfFile error:', err);
    throw new Error(err.message || 'PDF शेअर करताना त्रुटी आली.');
  }
}

/**
 * Save JSON Backup to device storage (Documents on Android / Download in browser)
 */
export async function saveBackupJsonToDevice(
  jsonString: string,
  fileName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Base64 encode JSON text for Filesystem
      const base64Data = window.btoa(unescape(encodeURIComponent(jsonString)));

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      return {
        success: true,
        message: `बॅकअप फाईल सेव्ह झाली (Documents/${fileName})!`,
      };
    } else {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      return {
        success: true,
        message: 'बॅकअप फाईल डाऊनलोड झाली!',
      };
    }
  } catch (err: any) {
    console.error('[nativePdfHandler] saveBackupJsonToDevice error:', err);
    throw new Error(err.message || 'बॅकअप सेव्ह करताना त्रुटी आली.');
  }
}
