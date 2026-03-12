/**
 * Slider de imágenes para la página principal
 */

window.SliderController = {
    track: null,
    slides: null,
    indicatorsContainer: null,
    indicators: null,
    currentIndex: 0,
    autoSlideInterval: null,
    autoSlideDelay: 5000, // 5 segundos

    /**
     * Inicializa el slider
     */
    init: function() {
        // Limpiar cualquier instancia anterior
        this.destroy();

        this.track = document.getElementById('sliderTrack');
        this.slides = document.querySelectorAll('.slide');
        this.indicatorsContainer = document.getElementById('sliderIndicators');

        // Verificar que los elementos existan
        if (!this.track || !this.slides.length || !this.indicatorsContainer) {
            console.log('Elementos del slider no encontrados - probablemente no estamos en la página principal');
            return;
        }

        console.log('Slider inicializado con', this.slides.length, 'slides');

        this.currentIndex = 0;
        this.createIndicators();
        this.setupEventListeners();
        this.startAutoSlide();
    },

    /**
     * Crea los indicadores
     */
    createIndicators: function() {
        // Limpiar indicadores existentes
        this.indicatorsContainer.innerHTML = '';

        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('slider-indicator');
            indicator.setAttribute('aria-label', `Ir a slide ${index + 1}`);
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });

        this.indicators = document.querySelectorAll('.slider-indicator');
    },

    /**
     * Configura los event listeners
     */
    setupEventListeners: function() {
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    },

    /**
     * Actualiza la posición del slider
     */
    updateSlider: function() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        console.log('Slider actualizado a índice:', this.currentIndex);

        // Actualizar indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    },

    /**
     * Va a un slide específico
     */
    goToSlide: function(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetAutoSlide();
    },

    /**
     * Va al siguiente slide
     */
    nextSlide: function() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider();
    },

    /**
     * Inicia el auto-slide
     */
    startAutoSlide: function() {
        // Limpiar cualquier intervalo existente
        this.stopAutoSlide();
        console.log('Auto-slide iniciado');
        this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
    },

    /**
     * Detiene el auto-slide
     */
    stopAutoSlide: function() {
        if (this.autoSlideInterval) {
            console.log('Auto-slide detenido');
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    },

    /**
     * Reinicia el auto-slide
     */
    resetAutoSlide: function() {
        this.stopAutoSlide();
        this.startAutoSlide();
    },

    /**
     * Maneja el gesto de swipe
     */
    handleSwipe: function(touchStartX, touchEndX) {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
                this.updateSlider();
            }
        }
    },

    /**
     * Destruye el slider (limpia event listeners e intervalos)
     */
    destroy: function() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
            console.log('Slider destruido');
        }
    }
};

