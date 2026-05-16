/**
 * Vista para actualizar la UI del stream
 */

const StreamView = {
  elements: {
    title: null,
    titleMobile: null,
    listeners: null,
    listenersMobile: null
  },

  /**
   * Inicializa los elementos del DOM
   */
  init: function() {
    this.elements.title = document.getElementById('title');
    this.elements.titleMobile = document.getElementById('title-mobile');
    this.elements.listeners = document.getElementById('listeners');
    this.elements.listenersMobile = document.getElementById('listeners-mobile');
  },

  /**
   * Devuelve el sufijo de bloque según el horario actual, o null si no aplica ninguno.
   */
  getBlockSuffix: function() {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
    const h = now.getHours();
    const m = now.getMinutes();
    const total = h * 60 + m;
    const isWeekday = day >= 1 && day <= 5;
    const isMonThu = day >= 1 && day <= 4;

    // Lun-Dom 0:00–3:00 → [Bloque Ochentoso]
    if (total >= 0 && total < 3 * 60) {
      return '[Bloque Ochentoso]';
    }

    // Lun-Vie 10:00–12:00 → [Bloque Nacional]
    if (isWeekday && total >= 10 * 60 && total < 12 * 60) {
      return '[Bloque Nacional]';
    }

    // Lun-Vie 16:00–18:00 → [Bloque 70's]
    if (isWeekday && total >= 16 * 60 && total < 18 * 60) {
      return "[Bloque 70's]";
    }

    // Lun-Jue 19:00–21:00 → [Bloque 80's & 90's]
    if (isMonThu && total >= 19 * 60 && total < 21 * 60) {
      return "[Bloque 80's & 90's]";
    }

    // Vie 18:00–21:00 y 21:05–00:00 → [Bloque Electrónica]
    if (day === 5 && (
      (total >= 18 * 60 && total < 21 * 60) ||
      (total >= 21 * 60 + 5)
    )) {
      return '[Bloque Electrónica]';
    }

    // Sáb 18:00–00:00 → [Bloque Electrónica]
    if (day === 6 && total >= 18 * 60) {
      return '[Bloque Electrónica]';
    }

    // Lun-Jue 22:00–00:00 → [Bloque Millenials]
    if (isMonThu && total >= 22 * 60) {
      return '[Bloque Millenials]';
    }

    return null;
  },

  /**
   * Devuelve el nombre del programa según el horario actual, o null si no hay ninguno programado.
   */
  getScheduledProgram: function() {
    const now = new Date();
    const day = now.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    const h = now.getHours();
    const m = now.getMinutes();
    const total = h * 60 + m;
    const isWeekday = day >= 1 && day <= 5;

    // Viernes 20:00 – 21:00 → Deep Wave Music
    if (day === 5 && total >= 20 * 60 && total < 21 * 60) {
      return 'Deep Wave Music';
    }

    // Lun–Vie 21:00–21:05 o 12:00–12:05 → Informe Económico Semanal
    if (isWeekday && (
      (total >= 21 * 60 && total < 21 * 60 + 5) ||
      (total >= 12 * 60 && total < 12 * 60 + 5)
    )) {
      return 'Informe Económico Semanal';
    }

    // Jueves 19:00 – 20:00 → Hartos de Todo
    if (day === 4 && total >= 19 * 60 && total < 20 * 60) {
      return 'Hartos de Todo';
    }

    return null;
  },

  /**
   * Actualiza la vista con los nuevos datos
   */
  render: function(data) {
    const scheduled = this.getScheduledProgram();
    const suffix = !scheduled ? this.getBlockSuffix() : null;
    const displayTitle = scheduled || (suffix ? data.title + ' ' + suffix : data.title);

    if (this.elements.title) {
      this.elements.title.textContent = displayTitle;
    }
    if (this.elements.titleMobile) {
      this.elements.titleMobile.textContent = displayTitle;
    }
    if (this.elements.listeners) {
      this.elements.listeners.textContent = data.listeners;
    }
    if (this.elements.listenersMobile) {
      this.elements.listenersMobile.textContent = data.listeners;
    }

    // Actualizar título de la ventana
    if (displayTitle) {
      document.title = displayTitle + ' | Alterna Radio FM 88.1 MHZ';
    }

    // Recalcular marquee en móvil si existe
    if (window.__updateMobileInfoMarquee) {
      setTimeout(window.__updateMobileInfoMarquee, 0);
    }
  }
};

window.StreamView = StreamView;

