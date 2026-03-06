// Gestor global de audio para coordinar reproducción
const AudioManager = {
  // Referencia al reproductor principal de la radio
  mainAudio: null,

  // Estado de pausa (para recordar si fue pausado por un programa)
  wasPausedByProgram: false,

  // Inicializar el gestor
  init: function() {
    this.mainAudio = document.getElementById('main-audio');
    console.log('AudioManager inicializado, mainAudio:', this.mainAudio);

    // Bind the handler to preserve 'this' context
    const self = this;
    window.addEventListener('hashchange', function() {
      console.log('AudioManager: hashchange event detected');
      self.handleNavigation();
    });

    // Si se reproduce cualquier otro audio, pausar la radio en vivo
    document.addEventListener('play', function(e) {
      console.log('AudioManager: Play event detectado en:', e.target);
      if (e.target && e.target.tagName === 'AUDIO' && e.target.id !== 'main-audio') {
        console.log('AudioManager: Audio de programa detectado, pausando radio principal');
        self.pauseMainAudio();
      }
    }, true);

    // También monitorear con un segundo método (sin capture)
    document.addEventListener('play', function(e) {
      if (e.target && e.target.tagName === 'AUDIO' && e.target.id !== 'main-audio') {
        console.log('AudioManager: Audio de programa detectado (bubble), pausando radio principal');
        self.pauseMainAudio();
      }
    }, false);
  },

  // Pausar el audio principal (radio en vivo)
  pauseMainAudio: function() {
    if (this.mainAudio && !this.mainAudio.paused) {
      console.log('AudioManager: Pausando radio en vivo...');
      this.mainAudio.pause();
      this.wasPausedByProgram = true;
    }
  },

  // Reanudar el audio principal
  resumeMainAudio: function() {
    if (this.mainAudio && this.mainAudio.paused) {
      console.log('AudioManager: Intentando reanudar radio...');
      // Solo intentar reproducir si está permitido
      const playPromise = this.mainAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('AudioManager: Radio reanudada exitosamente');
            this.wasPausedByProgram = false;
          })
          .catch(error => {
            console.log('AudioManager: No se puede reanudar (requiere interacción del usuario):', error.name);
          });
      }
    } else {
      console.log('AudioManager: Audio no está pausado o no existe');
    }
  },

  // Manejar navegación
  handleNavigation: function() {
    const hash = window.location.hash.substring(1) || 'en_vivo';
    const mainRoute = hash.split('/')[0];

    console.log('AudioManager: Hash detectado:', hash, '| Ruta principal:', mainRoute);

    // Si vuelve a en_vivo o no está en un programa, reanudar la radio
    if (mainRoute === 'en_vivo' || mainRoute === '' || mainRoute === 'contacto') {
      console.log('AudioManager: Ruta permite radio, reanudando...');
      this.resumeMainAudio();
    } else {
      console.log('AudioManager: Ruta es un programa, sin acción');
    }
  },

  // Calcular overflow del texto para animación de scroll en móvil
  checkInfoOverflow: function() {
    const infoContainers = document.querySelectorAll('.player-info-container-mobile .player-info');

    infoContainers.forEach(container => {
      const span = container.querySelector('span');
      if (!span) return;

      const containerWidth = container.offsetWidth;
      const spanWidth = span.scrollWidth;
      const overflow = Math.max(0, spanWidth - containerWidth);

      if (overflow > 0) {
        container.classList.add('is-overflow');
        container.style.setProperty('--overflow', overflow + 'px');
      } else {
        container.classList.remove('is-overflow');
        container.style.removeProperty('--overflow');
      }
    });
  }
};

// Verificar overflow cuando la página carga y cuando cambia el tamaño
if (typeof window !== 'undefined') {
  window.addEventListener('load', function() {
    AudioManager.checkInfoOverflow();
  });

  window.addEventListener('resize', function() {
    AudioManager.checkInfoOverflow();
  });

  // También verificar cuando se actualiza la información
  const observer = new MutationObserver(function() {
    AudioManager.checkInfoOverflow();
  });

  document.addEventListener('DOMContentLoaded', function() {
    const titleMobile = document.getElementById('title-mobile');
    const listenersMobile = document.getElementById('listeners-mobile');

    if (titleMobile) {
      observer.observe(titleMobile, { childList: true, characterData: true, subtree: true });
    }
    if (listenersMobile) {
      observer.observe(listenersMobile, { childList: true, characterData: true, subtree: true });
    }
  });
}

// Exponer AudioManager globalmente
window.AudioManager = AudioManager;
