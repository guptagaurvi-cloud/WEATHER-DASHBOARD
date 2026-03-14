document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const body = document.body;
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const backToTopBtn = document.getElementById("back-to-top");
    
    // Search Elements
    const searchForm = document.getElementById("search-form");
    const cityInput = document.getElementById("city-input");
    const errorMessage = document.getElementById("error-message");
    const dashboard = document.getElementById("dashboard");
    
    // UI Elements (Weather)
    const unitToggle = document.getElementById("unit-toggle");
    const unitSpans = unitToggle.querySelectorAll("span");
    
    let isCelsius = true;
    let currentCityData = null; // Store current city data to re-render on unit change

    // ---------------------------------------------------------
    // Mobile Menu & Navbar
    // ---------------------------------------------------------
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll(".mobile-menu a, .nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            mobileMenu.classList.remove("active");
        });
    });

    // Sticky Navbar & Back to Top behavior
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(255, 255, 255, 0.7)";
            navbar.style.boxShadow = "var(--glass-shadow)";
            backToTopBtn.style.opacity = "1";
            backToTopBtn.style.pointerEvents = "auto";
        } else {
            navbar.style.background = "var(--glass-bg)";
            navbar.style.boxShadow = "none";
            backToTopBtn.style.opacity = "0";
            backToTopBtn.style.pointerEvents = "none";
        }
        
        if(body.classList.contains("theme-night") && window.scrollY > 50) {
            navbar.style.background = "rgba(15, 23, 42, 0.8)";
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ---------------------------------------------------------
    // Unit Toggle
    // ---------------------------------------------------------
    unitToggle.addEventListener("click", () => {
        isCelsius = !isCelsius;
        unitSpans[0].classList.toggle("active", isCelsius);
        unitSpans[1].classList.toggle("active", !isCelsius);
        
        if (currentCityData) {
            updateDashboard(currentCityData);
        }
    });

    // ---------------------------------------------------------
    // Weather Data Fetching & Rendering
    // ---------------------------------------------------------
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const city = cityInput.value.trim().toLowerCase();
        
        if (!city) return;

        try {
            // First, hide any previous errors
            errorMessage.classList.add("hidden");
            
            const apiKey = "b2d60beb63cb4581b42170448261403";
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7`);
            
            if (!response.ok) {
                throw new Error("City not found");
            }
            
            const data = await response.json();
            
            // Map WeatherAPI response to our format
            const cityData = {
                name: data.location.name,
                country: data.location.country,
                current: {
                    temp_c: data.current.temp_c,
                    temp_f: data.current.temp_f,
                    description: data.current.condition.text,
                    icon: getFontAwesomeIcon(data.current.condition.code, data.current.is_day),
                    humidity: data.current.humidity,
                    wind_speed: data.current.wind_kph,
                    pressure: data.current.pressure_mb,
                    is_day: data.current.is_day === 1
                }
            };

            currentCityData = cityData;
            updateDashboard(cityData);
            
            // Show dashboard and scroll to it
            dashboard.classList.remove("hidden");
            
            // Small delay to allow CSS render before scrolling
            setTimeout(() => {
                dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);

        } catch (error) {
            console.error("Error fetching weather:", error);
            dashboard.classList.add("hidden");
            errorMessage.classList.remove("hidden");
        }
    });

    function updateDashboard(cityData) {
        // Update header
        document.getElementById("city-name-display").textContent = `${cityData.name}, ${cityData.country}`;
        
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("current-date").textContent = new Date().toLocaleDateString(undefined, dateOptions);

        // Update Theme based on day/night
        if (cityData.current.is_day) {
            body.classList.remove("theme-night");
            body.classList.add("theme-day");
        } else {
            body.classList.remove("theme-day");
            body.classList.add("theme-night");
        }

        // Current Weather Update
        const tempValue = isCelsius ? cityData.current.temp_c : cityData.current.temp_f;
        const tempUnit = isCelsius ? "°C" : "°F";
        
        // Use Math.round for display
        document.getElementById("current-temp").innerHTML = `${Math.round(tempValue)}<span class="unit">${tempUnit}</span>`;
        document.getElementById("main-weather-icon").className = `fa-solid ${cityData.current.icon} weather-icon-large`;
        document.getElementById("weather-description").textContent = cityData.current.description;
        
        // Details Update
        document.getElementById("humidity").textContent = `${cityData.current.humidity}%`;
        document.getElementById("wind-speed").textContent = `${cityData.current.wind_speed} km/h`;
        document.getElementById("pressure").textContent = `${cityData.current.pressure} hPa`;

    }



    function getFontAwesomeIcon(code, isDay) {
        // Mapping based on WeatherAPI condition codes
        if (code === 1000) return isDay ? "fa-sun" : "fa-moon";
        if (code === 1003) return isDay ? "fa-cloud-sun" : "fa-cloud-moon";
        if ([1006, 1009].includes(code)) return "fa-cloud";
        if ([1030, 1135, 1148].includes(code)) return "fa-smog";
        
        const rainCodes = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246];
        if (rainCodes.includes(code)) return "fa-cloud-rain";
        
        const snowCodes = [1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264];
        if (snowCodes.includes(code)) return "fa-snowflake";
        
        const thunderCodes = [1087, 1273, 1276, 1279, 1282];
        if (thunderCodes.includes(code)) return "fa-cloud-bolt";
        
        return "fa-cloud"; // fallback
    }

});
