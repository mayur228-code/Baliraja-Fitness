import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLanIp, getAccessibleBaseUrl, saveReport, getReport } from './serverApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

app.use(cors());
app.use(express.json());

// 1. Config endpoint
app.get('/api/config', (req, res) => {
  const lanIp = getLanIp();
  const baseUrl = getAccessibleBaseUrl(req, PORT);
  res.json({ lanIp, port: PORT, baseUrl });
});

// 2. Save report endpoint
app.post('/api/reports', (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData) {
      return res.status(400).json({ error: 'Report data is required' });
    }
    const result = saveReport(reportData, req, PORT);
    console.log(`[Report Created] ID: ${result.id} | URL: ${result.reportUrl}`);
    res.json(result);
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Internal server error saving report' });
  }
});

// 3. Get report by ID
app.get('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const data = getReport(id);
  if (!data) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(data);
});

// 4. Static assets & SPA fallback
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/report/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLanIp();
  console.log(`\n🌾 Baliraja Fitness Server Running!`);
  console.log(`- Local URL:   http://localhost:${PORT}`);
  console.log(`- Network URL: http://${lanIp}:${PORT}\n`);
});
