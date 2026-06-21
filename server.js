/**
 * server.js - Alterna Radio backend
 * Sirve los archivos estáticos, hace polling al stream Icecast
 * y guarda el historial de canciones en SQLite (node:sqlite nativo de Node >=22.5).
 *
 * Uso: node server.js   (o npm start)
 * Puerto: 3000 (o PORT env variable)
 */

const express  = require('express');
const { DatabaseSync } = require('node:sqlite');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------
// Base de datos SQLite
// -------------------------------------------------------
const db = new DatabaseSync(path.join(__dirname, 'history.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS song_history (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT NOT NULL,
    played_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
  )
`);

// -------------------------------------------------------
// Servir archivos estáticos
// -------------------------------------------------------
app.use(express.static(path.join(__dirname)));

// -------------------------------------------------------
// API: ultimas 10 canciones
// -------------------------------------------------------
app.get('/api/history', (req, res) => {
  try {
    const stmt  = db.prepare('SELECT id, title, played_at FROM song_history WHERE id < (SELECT MAX(id) FROM song_history) ORDER BY id DESC LIMIT 9');
    const songs = stmt.all();
    res.json({ success: true, songs });
  } catch (e) {
    console.error('DB error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// -------------------------------------------------------
// Polling al servidor Icecast (cada 5 segundos)
// -------------------------------------------------------
const STATUS_URL = 'http://localhost:8000/status-json.xsl';
let lastTitle = '';

function pickSource(source) {
  if (!source) return null;
  if (Array.isArray(source)) {
    return source.find(function(s) { return s.listenurl && s.listenurl.includes('/play'); }) || source[0];
  }
  return source;
}

function cleanTitle(raw) {
  if (!raw) return '';
  return raw.replace(/\.(mp3|ogg|flac|wav|aac|m4a)$/i, '').trim();
}

async function pollStream() {
  try {
    const res    = await fetch(STATUS_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const data     = await res.json();
    const icestats = data && data.icestats ? data.icestats : null;
    const source   = pickSource(icestats ? icestats.source : null);
    const raw      = source ? (source.title || source.server_name || '') : '';
    const title    = cleanTitle(raw);

    if (title && title !== lastTitle) {
      lastTitle = title;
      console.log('[' + new Date().toLocaleTimeString() + '] Cancion: ' + title);
      db.prepare('INSERT INTO song_history (title) VALUES (?)').run(title);
      // Mantener maximo 500 entradas
      db.prepare(
        'DELETE FROM song_history WHERE id NOT IN (SELECT id FROM song_history ORDER BY id DESC LIMIT 500)'
      ).run();
    }
  } catch (e) {
    // Stream no disponible, se reintenta en el proximo ciclo
  }
}

pollStream();
setInterval(pollStream, 5000);

// -------------------------------------------------------
// Iniciar servidor
// -------------------------------------------------------
app.listen(PORT, function() {
  console.log('Alterna Radio server -> http://localhost:' + PORT);
});
