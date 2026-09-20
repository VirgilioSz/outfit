// Weather Widget - OpenWeatherMap API (Saltillo, Coahuila, México)
const Weather = (function () {
    const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const API_KEY = '4b5116e67661e3c6978774f37939a8e4';
    const CITY = 'Saltillo,Coahuila,MX';

    const widget = document.getElementById('weather-widget');
    const toggle = document.getElementById('weather-toggle');
    const panel = document.getElementById('weather-panel');
    const closeBtn = document.getElementById('weather-close');

    const tempEl = document.getElementById('weather-temp');
    const tempLargeEl = document.getElementById('weather-temp-large');
    const descEl = document.getElementById('weather-desc');
    const feelsEl = document.getElementById('weather-feels');
    const humidityEl = document.getElementById('weather-humidity');
    const cityEl = document.getElementById('weather-city');
    const iconLargeEl = document.getElementById('weather-icon-large');

    let panelOpen = false;

    // Iconos meteorológicos minimalistas (Lucide)
    const WEATHER_ICONS = {
        'clear': 'sun',
        'clouds': 'cloud',
        'rain': 'cloud-rain',
        'drizzle': 'cloud-drizzle',
        'thunderstorm': 'cloud-lightning',
        'snow': 'cloud-snow',
        'mist': 'cloud-fog',
        'fog': 'cloud-fog',
        'haze': 'cloud-fog',
        'smoke': 'cloud-fog',
        'dust': 'cloud-fog',
        'sand': 'cloud-fog',
        'ash': 'cloud-fog',
        'squall': 'wind',
        'tornado': 'tornado',
    };

    function getIconName(weatherMain) {
        const mapped = WEATHER_ICONS[weatherMain.toLowerCase()];
        console.log('Weather main:', weatherMain, '-> mapped:', mapped);
        return mapped || 'cloud';
    }

    function setIcon(elementOrId, iconName) {
        const container = typeof elementOrId === 'string' 
            ? document.getElementById(elementOrId) 
            : elementOrId;
        if (!container) {
            console.warn('Element not found for icon:', elementOrId);
            return;
        }
        
        // Get SVG from Lucide icons
        if (typeof lucide !== 'undefined' && lucide.icons && lucide.icons[iconName]) {
            const iconData = lucide.icons[iconName];
            // lucide icons have a 'svg' property with the SVG markup
            if (iconData.svg) {
                container.innerHTML = iconData.svg;
                // Apply size and color
                const svg = container.querySelector('svg');
                if (svg) {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.style.color = 'currentColor';
                }
            } else if (iconData.toSvg) {
                // Some versions have toSvg method
                container.innerHTML = iconData.toSvg({ width: '100%', height: '100%' });
            }
        } else {
            console.warn('Lucide icon not found:', iconName);
            // Fallback to data-lucide approach
            container.innerHTML = '';
            container.setAttribute('data-lucide', iconName);
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    function showError(message) {
        tempEl.textContent = '--°';
        tempLargeEl.textContent = '--°';
        descEl.textContent = message;
        feelsEl.textContent = '--°';
        humidityEl.textContent = '--%';
        cityEl.textContent = 'Saltillo, Coahuila';
        setIcon('weather-icon-large', 'alert-circle');
        setIcon('weather-icon-main', 'alert-circle');
    }

    async function fetchWeather(cityName) {
        try {
            const url = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=es`;
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('API key inválida');
                }
                if (response.status === 404) {
                    throw new Error('Ciudad no encontrada');
                }
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();
            return {
                temp: Math.round(data.main.temp),
                feels_like: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                description: data.weather[0].description,
                main: data.weather[0].main,
                city: data.name,
                country: data.sys.country,
            };
        } catch (error) {
            console.error('Weather fetch error:', error);
            throw error;
        }
    }

    async function loadWeather() {
        try {
            const data = await fetchWeather(CITY);
            if (data) {
                updateDisplay(data);
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            showError(error.message);
        }
    }

    function updateDisplay(data) {
        tempEl.textContent = `${data.temp}°`;
        tempLargeEl.textContent = `${data.temp}°`;
        descEl.textContent = data.description.charAt(0).toUpperCase() + data.description.slice(1);
        feelsEl.textContent = `${data.feels_like}°`;
        humidityEl.textContent = `${data.humidity}%`;
        cityEl.textContent = 'Saltillo, Coahuila, México';

        console.log('Weather data:', data);
        console.log('Weather main:', data.main);
        
        const iconName = getIconName(data.main);
        console.log('Icon name:', iconName);
        
        setIcon('weather-icon-large', iconName);
        setIcon('weather-icon-main', iconName);
    }

    function togglePanel() {
        panelOpen = !panelOpen;
        panel.hidden = !panelOpen;
        toggle.setAttribute('aria-expanded', panelOpen);

        if (panelOpen) {
            closeBtn.focus();
        }
    }

    function closePanel() {
        panelOpen = false;
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    }

    function init() {
        // Toggle panel
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePanel();
        });

        // Close panel
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (panelOpen && !widget.contains(e.target)) {
                closePanel();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panelOpen) {
                closePanel();
            }
        });

        // Load initial weather
        loadWeather();

        // Auto-refresh every 10 minutes
        setInterval(loadWeather, 10 * 60 * 1000);
    }

    // Public API
    return {
        init,
        refresh: loadWeather,
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Weather.init();
});

window.Weather = Weather;