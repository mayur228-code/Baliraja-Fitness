import 'regenerator-runtime/runtime.js';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function testPdfLib() {
  const pdfBytes = fs.readFileSync('public/BAR.pdf');
  const fontBytes = fs.readFileSync('public/mangalb.ttf');

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();
  console.log(`Page dimensions: ${width} x ${height}`);

  // Test drawText with custom Marathi font
  firstPage.drawText('गणेश शिंदे', {
    x: 85,
    y: height - 80,
    size: 11,
    font: customFont,
    color: rgb(0, 0, 0.7),
  });

  // Test numbers and latin text with HelveticaBold
  firstPage.drawText('9876543210', {
    x: 395,
    y: height - 90,
    size: 11,
    font: helveticaBold,
    color: rgb(0, 0, 0.7),
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync('public/test_pdf_lib.pdf', modifiedPdfBytes);
  console.log('Successfully generated public/test_pdf_lib.pdf with fontkit!');
}

testPdfLib().catch(console.error);
