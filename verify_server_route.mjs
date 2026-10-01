import express from 'express';
import path from 'path';

const app = express();
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(5175, async () => {
  try {
    const res = await fetch('http://127.0.0.1:5175/download');
    const text = await res.text();
    console.log('HTTP Status:', res.status);
    console.log('HTML contains root element:', text.includes('id="root"'));
    console.log('Content-Type:', res.headers.get('content-type'));
    server.close();
    process.exit(0);
  } catch (e) {
    console.error('Fetch error:', e);
    server.close();
    process.exit(1);
  }
});
