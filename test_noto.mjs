import 'regenerator-runtime/runtime.js';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function testNoto() {
  const pdfBytes = fs.readFileSync('public/BAR.pdf');
  const fontBytes = fs.readFileSync('public/NotoSansDevanagari-Bold.ttf');

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize();

  // Test drawText with NotoSansDevanagari
  firstPage.drawText('गणेश शिंदे', {
    x: 85,
    y: height - 80,
    size: 11,
    font: customFont,
    color: rgb(0, 0, 0.7),
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/test_noto.pdf', modifiedPdfBytes);
  console.log('Successfully generated public/test_noto.pdf!');
}

testNoto().catch(console.error);
