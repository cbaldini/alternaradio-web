/**
 * Slider de imágenes - carrusel continuo con peek de slides adyacentes
 * Desktop: horizontal | Mobile: vertical
 */

window.SliderController = {
    track: null,
    slides: null,
    indicatorsContainer: null,
    indicators: null,
    currentIndex: 0,
    autoSlideInterval: null,
    autoSlideDelay: 5000,

    // Fracción del container que ocupa cada slide
    SLIDE_FRAC: 0.72,
    // Gap entre slides en px
    GAP: 12,

    init: function() {
        this.destroy();

        this.track = document.getElementById('sliderTrack');
        this.slides = document.querySelectorAll('.slide');
        this.indicatorsContainer = document.getElementById('sliderIndicators');

        if (!this.track || !this.slides.length || !this.indicatorsContainer) return;

        this.currentIndex = 0;
        this.createIndicators();
        this.setupEventListeners();

        // Esperar que las imágenes carguen para tener dimensiones reales
        const imgs = Array.from(this.track.querySelectorAll('img'));
        const pending = imgs.filter(img => !img.complete);

        const afterLoad = () => {
            // Desktop: inyectar blur. Mobile: sin blur. Slides con clase no-blur no tienen efecto.
            this.slides.forEach(slide => {
                let bgDiv = slide.querySelector('.slide-bg-blur');
                if (!this.isVertical() && !slide.classList.contains('no-blur')) {
                    if (!bgDiv) {
                        bgDiv = document.createElement('div');
                        bgDiv.classList.add('slide-bg-blur');
                        slide.insertBefore(bgDiv, slide.firstChild);
                    }
                    const img = slide.querySelector('img');
                    if (img) bgDiv.style.backgroundImage = `url('${img.src}')`;
                } else {
                    if (bgDiv) bgDiv.style.display = 'none';
                }
            });
            this.updateSlider(false);
            this.startAutoSlide();
        };

        if (pending.length === 0) {
            afterLoad();
        } else {
            let loaded = 0;
            pending.forEach(img => {
                const done = () => { loaded++; if (loaded === pending.length) afterLoad(); };
                img.addEventListener('load', done);
                img.addEventListener('error', done);
            });
        }

        window.addEventListener('resize', () => this.updateSlider(false));
    },

    initMobileStack: function() {
        this.stopAutoSlide();
        const container = this.track.closest('.slider-container');
        // Quitar altura fija del container
        container.style.height = '';
        container.style.overflow = 'visible';

        // Resetear el track para que sea una columna estática
        this.track.style.flexDirection = 'column';
        this.track.style.transform = 'none';
        this.track.style.transition = 'none';
        this.track.style.flexWrap = 'wrap';

        this.slides.forEach(slide => {
            slide.style.width = '100%';
            slide.style.minWidth = '';
            slide.style.height = 'auto';
            slide.style.flexShrink = '0';
            slide.style.margin = '0 0 8px 0';
            slide.style.opacity = '1';
            // Quitar blur si existe
            const bgDiv = slide.querySelector('.slide-bg-blur');
            if (bgDiv) bgDiv.style.display = 'none';
            const a = slide.querySelector('a');
            if (a) { a.style.display = 'block'; a.style.width = '100%'; a.style.height = 'auto'; }
            const img = slide.querySelector('img');
            if (img) { img.style.width = '100%'; img.style.height = 'auto'; img.style.objectFit = 'contain'; img.style.display = 'block'; img.style.position = 'static'; img.style.zIndex = ''; }
        });

        // Ocultar indicadores
        if (this.indicatorsContainer) this.indicatorsContainer.style.display = 'none';
    },

    destroyMobileStack: function() {
        const container = this.track.closest('.slider-container');
        container.style.overflow = 'hidden';
        this.track.style.flexWrap = 'nowrap';
        if (this.indicatorsContainer) this.indicatorsContainer.style.display = '';
        this.slides.forEach(slide => {
            const bgDiv = slide.querySelector('.slide-bg-blur');
            if (bgDiv) bgDiv.style.display = '';
        });
    },

    getAvailableHeight: function() {
        const container = this.track.closest('.slider-container');
        const top = container.getBoundingClientRect().top;
        const footer = document.querySelector('.site-footer');
        const footerH = footer ? footer.offsetHeight : 0;
        return Math.floor(window.innerHeight - top - footerH);
    },

    isVertical: function() {
        return window.innerWidth <= 768;
    },

    updateSlider: function(animate) {
        const container = this.track.closest('.slider-container');
        const vertical = this.isVertical();

        const availH = this.getAvailableHeight();

        if (vertical) {
            const H = availH;
            container.style.height = H + 'px';
            container.style.overflow = 'hidden';

            const W = container.offsetWidth;

            // Altura exacta según aspect ratio real → imagen completa, sin recorte ni negro
            const slideHeights = [];
            this.slides.forEach(slide => {
                const img = slide.querySelector('img');
                let h;
                if (img && img.naturalWidth && img.naturalHeight) {
                    h = Math.floor(W * img.naturalHeight / img.naturalWidth);
                } else {
                    h = Math.floor(W * 0.75);
                }
                slideHeights.push(h);
            });

            const slideH = slideHeights[this.currentIndex];
            const centerOffset = Math.floor((H - slideH) / 2);
            let offset = centerOffset;
            for (let i = 0; i < this.currentIndex; i++) {
                offset -= slideHeights[i];
            }

            this.track.style.flexDirection = 'column';
            this.track.style.transition = animate === false ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            this.track.style.transform = `translateY(${offset}px)`;

            this.slides.forEach((slide, i) => {
                slide.style.width = '100%';
                slide.style.minWidth = '';
                slide.style.height = slideHeights[i] + 'px';
                slide.style.flexShrink = '0';
                slide.style.margin = '0';
                slide.style.opacity = i === this.currentIndex ? '1' : '0.6';
                const bgDiv = slide.querySelector('.slide-bg-blur');
                if (bgDiv) bgDiv.style.display = 'none';
                const a = slide.querySelector('a');
                if (a) { a.style.display = 'block'; a.style.width = '100%'; a.style.height = '100%'; }
                const img = slide.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'fill'; // dimensiones exactas al aspect ratio → sin recorte ni negro
                    img.style.display = 'block';
                    img.style.position = 'relative';
                    img.style.zIndex = '1';
                }
            });

        } else {
            const H = availH;
            container.style.height = H + 'px';
            const W = container.offsetWidth;

            const slideWidths = [];
            this.slides.forEach(slide => {
                const img = slide.querySelector('img');
                let slideW;
                if (img && img.naturalWidth && img.naturalHeight) {
                    slideW = Math.floor(H * img.naturalWidth / img.naturalHeight);
                    slideW = Math.min(slideW, Math.floor(W * 0.85));
                } else {
                    slideW = Math.floor(W * 0.75);
                }
                slideWidths.push(slideW);
            });

            let offset = Math.floor((W - slideWidths[this.currentIndex]) / 2);
            for (let i = 0; i < this.currentIndex; i++) {
                offset -= slideWidths[i];
            }

            this.track.style.flexDirection = 'row';
            this.track.style.transition = animate === false ? 'none' : 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            this.track.style.transform = `translateX(${offset}px)`;

            this.slides.forEach((slide, i) => {
                slide.style.height = H + 'px';
                slide.style.minWidth = slideWidths[i] + 'px';
                slide.style.width = slideWidths[i] + 'px';
                slide.style.flexShrink = '0';
                slide.style.margin = '0';
                const a = slide.querySelector('a');
                if (a) { a.style.display = 'block'; a.style.width = '100%'; a.style.height = '100%'; }
                const img = slide.querySelector('img');
                if (img) { img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'contain'; img.style.display = 'block'; img.style.position = 'relative'; img.style.zIndex = '1'; }
            });
        }

        if (this.indicators) {
            this.indicators.forEach((ind, i) => ind.classList.toggle('active', i === this.currentIndex));
        }

        this.slides.forEach((slide, i) => {
            slide.style.opacity = i === this.currentIndex ? '1' : '0.5';
        });

        const blurBg = document.getElementById('sliderBlurBg');
        if (blurBg) {
            const img = this.slides[this.currentIndex].querySelector('img');
            if (img) blurBg.style.backgroundImage = `url('${img.src}')`;
        }
    },

    createIndicators: function() {
        this.indicatorsContainer.innerHTML = '';
        this.slides.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.classList.add('slider-indicator');
            btn.setAttribute('aria-label', `Ir a slide ${i + 1}`);
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(btn);
        });
        this.indicators = document.querySelectorAll('.slider-indicator');
    },

    setupEventListeners: function() {
        let startX = 0, startY = 0;

        this.track.addEventListener('touchstart', e => {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }, { passive: true });

        this.track.addEventListener('touchend', e => {
            const dx = startX - e.changedTouches[0].screenX;
            const dy = startY - e.changedTouches[0].screenY;
            if (this.isVertical()) {
                if (Math.abs(dy) > 40) dy < 0 ? this.nextSlide() : this.prevSlide();
            } else {
                if (Math.abs(dx) > 40) dx > 0 ? this.nextSlide() : this.prevSlide();
            }
        }, { passive: true });
    },

    goToSlide: function(i) {
        this.currentIndex = i;
        this.updateSlider(true);
        this.resetAutoSlide();
    },

    nextSlide: function() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider(true);
    },

    prevSlide: function() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlider(true);
    },

    startAutoSlide: function() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
    },

    stopAutoSlide: function() {
        if (this.autoSlideInterval) { clearInterval(this.autoSlideInterval); this.autoSlideInterval = null; }
    },

    resetAutoSlide: function() { this.stopAutoSlide(); this.startAutoSlide(); },

    destroy: function() { this.stopAutoSlide(); }
};
