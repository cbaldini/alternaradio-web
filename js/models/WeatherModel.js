/**
 * Modelo para manejar datos del clima
 */

const WeatherModel = {
  apiKey: "3149f60c12d9d9b93fb69869674708c6",
  // Coordenadas exactas de Miramar, Buenos Aires, Argentina
  lat: -38.2667,
  lon: -57.8333,
  units: "metric",
  updateInterval: 300000, // 5 minutos
  currentData: {
    temperature: null,
    city: "Miramar"
  },

  /**
   * Obtiene los datos del clima desde la API usando coordenadas exactas
   */
  fetchWeatherData: function() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&units=${this.units}&appid=${this.apiKey}&lang=es`;

    return fetch(url)
      .then(res => res.json())
      .then(apiResponse => {
        console.log('Weather API Response:', apiResponse); // Para debug
        this.currentData.temperature = Math.round(apiResponse.main.temp);
        return this.currentData;
      })
      .catch(err => {
        console.error('Error weather:', err);
        return null;
      });
  },

  /**
   * Obtiene los datos actuales
   */
  getData: function() {
    return this.currentData;
  }
};

window.WeatherModel = WeatherModel;

