import fs from 'fs';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { PDFDocument } from 'pdf-lib';

async function testPdfWithQr() {
  const sampleUrl = 'http://10.15.148.37:5173/report/BAR-2026-DEMO';
  console.log('Generating QR for URL:', sampleUrl);

  const qrDataUrl = await QRCode.toDataURL(sampleUrl, {
    margin: 2,
    width: 300,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' }
  });

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrPngBuffer = Buffer.from(base64Data, 'base64');

  // Embed directly onto BAR.pdf
  const pdfBytes = fs.readFileSync('public/BAR.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);

  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // In pdf-lib bottom-left coords: top-right header at x=505, y = 842.25 - 94 = 748.25
  page.drawImage(qrImage, {
    x: 506,
    y: height - 94,
    width: 58,
    height: 58,
  });

  const modifiedBytes = await pdfDoc.save();
  fs.writeFileSync('public/test_pdf_with_qr.pdf', modifiedBytes);
  console.log('Successfully created public/test_pdf_with_qr.pdf');
}

testPdfWithQr().catch(console.error);
