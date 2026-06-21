/**
 * HistoryController - Últimas canciones reproducidas
 * Consume GET /api/history (provisto por server.js) y renderiza el panel.
 */

const HistoryController = {
  container: null,
  intervalId: null,
  UPDATE_MS: 15000, // actualizar cada 15s

  init: function () {
    this.container = document.getElementById('song-history-list');
    if (!this.container) return;
    this.load();
    this.intervalId = setInterval(function () {
      HistoryController.load();
    }, this.UPDATE_MS);
  },

  load: function () {
    fetch('/api/history')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && Array.isArray(data.songs)) {
          HistoryController.render(data.songs);
        }
      })
      .catch(function () {
        // servidor no disponible: no hacer nada
      });
  },

  render: function (songs) {
    if (!this.container) return;
    if (!songs.length) {
      this.container.innerHTML = '<li class="history-empty">Sin canciones aún</li>';
      return;
    }
    this.container.innerHTML = songs.map(function (song, i) {
      return (
        '<li class="history-item">' +
          '<span class="history-num">' + '-' + (i + 1) + '</span>' +
          '<span class="history-title">' + HistoryController.escapeHtml(Helpers.cleanTitle(song.title)) + '</span>' +
          '<span class="history-time">' + HistoryController.relativeTime(song.played_at) + '</span>' +
        '</li>'
      );
    }).join('');
  },

  relativeTime: function (dateStr) {
    if (!dateStr) return '';
    var then = new Date(dateStr);
    var diff = Math.floor((Date.now() - then.getTime()) / 1000);
    if (isNaN(diff) || diff < 0) return '';
    if (diff < 60)   return 'ahora';
    if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + ' h';
    return 'hace ' + Math.floor(diff / 86400) + ' d';
  },

  escapeHtml: function (text) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(text || ''));
    return d.innerHTML;
  },

  destroy: function () {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }
};

window.HistoryController = HistoryController;

