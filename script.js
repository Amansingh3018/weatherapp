const API_KEY = '8c4e0fa3f5c1c4c0c0c0c0c0c0c0c0c0'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityButtons = document.querySelectorAll('.city-btn');
const cityName = document.getElementById('city-name');
const date = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temp = document.getElementById('temp');
const description = document.getElementById('description');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');

// Loading state
let isLoading = false;

// Update date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    date.textContent = now.toLocaleDateString('en-US', options);
}

// Show loading state
function setLoading(loading) {
    isLoading = loading;
    searchBtn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-search"></i>';
    searchBtn.disabled = loading;
    cityButtons.forEach(btn => btn.disabled = loading);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4444;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Fetch weather data
async function getWeatherData(city) {
    if (isLoading) return;
    
    setLoading(true);
    try {
        // Encode the city name to handle special characters
        const encodedCity = encodeURIComponent(city);
        const url = `${BASE_URL}?q=${encodedCity}&units=metric&appid=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '404') {
            showError('City not found. Please try again.');
            return;
        }

        if (data.cod !== 200) {
            showError('Error fetching weather data. Please try again.');
            return;
        }

        updateWeatherUI(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Error fetching weather data. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Update UI with weather data
function updateWeatherUI(data) {
    try {
        cityName.textContent = data.name;
        temp.textContent = `${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description;
        wind.textContent = `Wind: ${data.wind.speed} km/h`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
        
        // Update weather icon with error handling
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // Preload the image
        const img = new Image();
        img.onload = () => {
            weatherIcon.src = iconUrl;
            weatherIcon.style.animation = 'none';
            weatherIcon.offsetHeight; // Trigger reflow
            weatherIcon.style.animation = 'fadeIn 0.5s ease-in-out';
        };
        img.onerror = () => {
            weatherIcon.src = 'https://openweathermap.org/img/wn/01d@2x.png'; // Default icon
        };
        img.src = iconUrl;
    } catch (error) {
        console.error('Error updating UI:', error);
        showError('Error displaying weather data');
    }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

cityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const city = button.dataset.city;
        cityInput.value = city;
        getWeatherData(city);
    });
});

// Add input validation
cityInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
});

// Initialize
updateDate();
getWeatherData('Mumbai'); // Default city 
