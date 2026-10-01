import fs from 'fs';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const imgBuffer = fs.readFileSync('public/test_pdf_with_qr_preview.png');
const png = PNG.sync.read(imgBuffer);

// jsQR scan
const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

if (code) {
  console.log('🎉 QR CODE DECODED DIRECTLY FROM THE RENDERED PDF IMAGE!');
  console.log('Decoded Payload URL:', code.data);
} else {
  console.error('❌ Could not decode QR code from full image.');
  process.exit(1);
}
