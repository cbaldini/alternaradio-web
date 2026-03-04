// Configuración global del sitio
const CONFIG = {
    // Dominio base del sitio (sin trailing slash)
    domain: 'https://radio.alterna.ar',

    // URL del servidor Icecast para streaming (mantener en alternaradio.ar)
    streamUrl: 'https://radio.alterna.ar:8443/play',

    // URL del endpoint de status del servidor Icecast (mantener en alternaradio.ar)
    statusUrl: 'https://radio.alterna.ar:8443/status-json.xsl'
};

// Exponer CONFIG globalmente
window.CONFIG = CONFIG;
