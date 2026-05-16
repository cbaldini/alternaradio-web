/**
 * Controlador de UI (menú hamburguesa, dropdown, etc.)
 */

const UIController = {
  hamburgerBtn: null,
  navbarMenu: null,
  dropdowns: null,

  /**
   * Inicializa el controlador de UI
   */
  init: function() {
    this.hamburgerBtn = document.getElementById('hamburger-btn');
    this.navbarMenu = document.getElementById('navbar-menu');
    this.dropdowns = document.querySelectorAll('.dropdown');

    if (!this.hamburgerBtn || !this.navbarMenu) {
      console.error('Elementos de UI no encontrados');
      return;
    }

    this.setupEventListeners();
    this.setupResponsiveBehavior();
  },

  /**
   * Configura los event listeners
   */
  setupEventListeners: function() {
    // Toggle del menú hamburguesa
    this.hamburgerBtn.addEventListener('click', () => {
      this.hamburgerBtn.classList.toggle('active');
      this.navbarMenu.classList.toggle('active');
      // Recalcular padding tras la transición
      setTimeout(() => this.adjustBodyPadding(), 350);
    });

    // Cerrar menú al hacer click en un link
    const navLinks = this.navbarMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburgerBtn.classList.remove('active');
        this.navbarMenu.classList.remove('active');
      });
    });

    // Toggle de dropdowns en móvil
    this.dropdowns.forEach(dropdown => {
      const dropbtn = dropdown.querySelector('.dropbtn');
      dropbtn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('active');
        }
      });
    });

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        this.dropdowns.forEach(dropdown => {
          dropdown.classList.remove('active');
        });
      }
    });
  },

  /**
   * Configura comportamiento responsive
   */
  setupResponsiveBehavior: function() {
    this.adjustBodyPadding();

    // Ajustar después de delays para asegurar renderizado
    setTimeout(() => this.adjustBodyPadding(), 100);
    setTimeout(() => this.adjustBodyPadding(), 500);

    // Ajustar en resize
    window.addEventListener('resize', () => this.adjustBodyPadding());

    // Ajustar cuando todo esté cargado
    window.addEventListener('load', () => this.adjustBodyPadding());
  },

  /**
   * Ajusta el padding del body según la altura de la barra superior.
   * En desktop: el CSS ya lo maneja con variables.
   * En mobile: ajusta dinámicamente según el navbar colapsable.
   */
  adjustBodyPadding: function() {
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
      return;
    }

    // En mobile: si el navbar está abierto, contar su altura
    const topBar = document.querySelector('.top');
    const navbar = document.querySelector('.navbar');
    if (topBar && navbar) {
      const topBarHeight = topBar.offsetHeight;
      const navbarHeight = navbar.classList.contains('active') ? navbar.offsetHeight : 0;
      const totalHeight = topBarHeight + navbarHeight;
      document.body.style.paddingTop = totalHeight + 'px';
      console.log('Body padding ajustado (mobile):', totalHeight + 'px');
    }
  },

  /**
   * Actualiza el marquee de información móvil
   */
  updateMobileInfoMarquee: function() {
    if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;

    const infos = document.querySelectorAll('.player-info-container-mobile .player-info');
    infos.forEach((info) => {
      const span = info.querySelector('span');
      if (!span) return;

      // Reset
      info.classList.remove('is-overflow');
      info.style.removeProperty('--overflow');
      span.style.transform = '';

      // Medición
      const overflow = span.scrollWidth - info.clientWidth;
      if (overflow > 10) {
        info.classList.add('is-overflow');
        info.style.setProperty('--overflow', overflow + 'px');
      }
    });
  }
};

window.UIController = UIController;

