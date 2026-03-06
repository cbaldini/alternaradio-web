/**
 * Controlador de contenido dinámico (SPA Router)
 */

window.ContentController = {
  contentContainer: null,

  /**
   * Inicializa el controlador
   */
  init: function() {
    this.contentContainer = document.getElementById('content');
    if (!this.contentContainer) {
      console.error('Contenedor de contenido no encontrado');
      return;
    }

    this.loadFromHash();
    window.addEventListener('hashchange', () => this.loadFromHash());
  },

  /**
   * Resuelve la ruta del hash
   */
  resolvePath: function(hash) {
    const parts = hash.split('/');
    const root = parts[0];
    const slug = parts[1];

    if (hash === '' || hash === 'en_vivo') return 'views/main.html';
    if (hash === 'contacto') return 'views/contacto.html';

    if (root === 'ies') {
      return slug ? `views/informe_economico_semanal/${slug}.html` : 'views/informe_economico_semanal/ies.html';
    }
    if (root === 'hr') {
      return slug ? `views/humana_resistencia/${slug}.html` : 'views/humana_resistencia/hr.html';
    }
    if (root === 'lml') {
      return slug ? `views/libertad_motosierra_licuadora/${slug}.html` : 'views/libertad_motosierra_licuadora/lml.html';
    }
    if (root === 'veo') {
      return slug ? `views/voz_en_off/${slug}.html` : 'views/voz_en_off/veo.html';
    }

    return 'views/main.html';
  },

  /**
   * Carga contenido basado en el hash
   */
  loadFromHash: function() {
    const hash = window.location.hash.substring(1);
    const path = this.resolvePath(hash);
    const parts = hash.split('/');
    const hasProgram = parts.length > 1 && parts[1]; // Verifica si es una página de programa específica

    console.log('ContentController: Cargando', path, 'hasProgram:', hasProgram);

    fetch(path, { cache: 'no-store' })
      .then(res => res.ok ? res.text() : Promise.reject(res))
      .then(html => {
        this.contentContainer.innerHTML = html;

        // Si es una página de programa específica, pausar el audio principal
        if (hasProgram && window.AudioManager) {
          console.log('ContentController: Página de programa detectada, pausando audio principal');
          // Pausar inmediatamente
          AudioManager.pauseMainAudio();
          // Y nuevamente después de un pequeño delay por si acaso
          setTimeout(() => {
            AudioManager.pauseMainAudio();
          }, 100);
          setTimeout(() => {
            AudioManager.pauseMainAudio();
          }, 500);
        }

        // Inicializar selectores de programa si existe el módulo
        if (window.ProgramSelect && typeof window.ProgramSelect.init === 'function') {
          window.ProgramSelect.init(this.contentContainer);
        }

        // Agregar listener a cualquier elemento de audio que se haya cargado
        const audioElements = this.contentContainer.querySelectorAll('audio');
        console.log('ContentController: Elementos de audio encontrados:', audioElements.length);
        audioElements.forEach((audio, index) => {
          console.log('ContentController: Agregando listener a audio', index);

          // Listener para cuando empieza a reproducirse
          audio.addEventListener('play', () => {
            console.log('ContentController: Audio de programa comenzó a reproducirse');
            if (window.AudioManager) {
              AudioManager.pauseMainAudio();
            }
          });

          // Listener para cuando está cargando
          audio.addEventListener('loadstart', () => {
            console.log('ContentController: Audio de programa comenzó a cargar');
            if (window.AudioManager) {
              AudioManager.pauseMainAudio();
            }
          });

          // Si tiene autoplay, pausar inmediatamente
          if (audio.hasAttribute('autoplay')) {
            console.log('ContentController: Audio tiene autoplay, pausando radio');
            if (window.AudioManager) {
              AudioManager.pauseMainAudio();
            }
          }
        });
      })
      .catch(() => {
        this.contentContainer.innerHTML = '<p>No se pudo cargar el contenido.</p>';
      });
  },

  /**
   * Navega a una ruta específica
   */
  navigate: function(route) {
    window.location.hash = '#' + route;
  }
};


