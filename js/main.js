(function () {
    'use strict';

    const COND_CLASSES = ['cond-sunny', 'cond-rainy', 'cond-snowy', 'cond-cloudy', 'cond-night'];

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function safe(obj, ...path) {
        let cur = obj;
        for (const k of path) {
            if (cur == null) return undefined;
            cur = cur[k];
        }
        return cur;
    }

    function getWeatherIconClass(desc, isNight) {
        const d = (desc || '').toLowerCase();
        if (d.includes('rain') || d.includes('drizzle')) return 'fa-solid fa-cloud-showers-heavy';
        if (d.includes('thunder')) return 'fa-solid fa-bolt';
        if (d.includes('snow') || d.includes('sleet') || d.includes('blizzard')) return 'fa-solid fa-snowflake';
        if (d.includes('clear') || d.includes('sunny')) return isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        if (d.includes('cloud') || d.includes('overcast')) return 'fa-solid fa-cloud';
        if (d.includes('fog') || d.includes('mist') || d.includes('haze')) return 'fa-solid fa-smog';
        if (d.includes('wind')) return 'fa-solid fa-wind';
        return isNight ? 'fa-solid fa-cloud-moon' : 'fa-solid fa-cloud-sun';
    }

    function getConditionClass(desc, isNight) {
        const d = (desc || '').toLowerCase();
        if (isNight) return 'cond-night';
        if (d.includes('rain') || d.includes('drizzle') || d.includes('thunder')) return 'cond-rainy';
        if (d.includes('snow') || d.includes('sleet') || d.includes('blizzard')) return 'cond-snowy';
        if (d.includes('cloud') || d.includes('overcast') || d.includes('fog') || d.includes('mist') || d.includes('haze')) return 'cond-cloudy';
        if (d.includes('clear') || d.includes('sunny')) return 'cond-sunny';
        return '';
    }

    function parseTimeToMinutes(str) {
        if (!str) return null;
        const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!m) return null;
        let h = parseInt(m[1], 10);
        const mins = parseInt(m[2], 10);
        const ap = m[3] && m[3].toUpperCase();
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return h * 60 + mins;
    }

    function isNightNow(localObsDateTime, sunrise, sunset) {
        const sr = parseTimeToMinutes(sunrise);
        const ss = parseTimeToMinutes(sunset);
        if (sr == null || ss == null) return false;
        let nowMin;
        if (localObsDateTime) {
            const t = localObsDateTime.split(' ')[1];
            const tm = parseTimeToMinutes(t);
            if (tm != null) nowMin = tm;
        }
        if (nowMin == null) {
            const d = new Date();
            nowMin = d.getHours() * 60 + d.getMinutes();
        }
        return nowMin < sr || nowMin >= ss;
    }

    function formatObserved(localObsDateTime) {
        if (!localObsDateTime) return '—';
        const parts = localObsDateTime.split(' ');
        if (parts.length < 2) return localObsDateTime;
        return parts[1];
    }

    function formatDay(dateStr, idx) {
        if (!dateStr) return idx === 0 ? 'Today' : '';
        if (idx === 0) return 'Today';
        if (idx === 1) return 'Tomorrow';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return DAY_NAMES[d.getDay()];
    }

    function setBodyCondition(klass) {
        const body = document.body;
        COND_CLASSES.forEach(c => body.classList.remove(c));
        if (klass) body.classList.add(klass);
    }

    function showError(errorEl, message) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }

    function clearError(errorEl) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
    }

    function buildHero({ cityName, region, country, iconURL, weatherDesc, faIcon, temp, feelsLike, hi, lo, observed }) {
        const place = [region, country].filter(Boolean).join(', ');
        return `
            <section class="hero-card">
                <div class="hero-top">
                    <div class="hero-location">
                        <h2 class="city-name">${cityName}</h2>
                        <div class="region-country">${place || '&nbsp;'}</div>
                    </div>
                    ${iconURL
                        ? `<img class="hero-icon" src="${iconURL}" alt="" aria-hidden="true">`
                        : `<i class="${faIcon} hero-icon" style="font-size:5rem; color: var(--accent);" aria-hidden="true"></i>`}
                </div>
                <div class="hero-temp-row">
                    <span class="temp">${temp}<span class="temp-unit">°C</span></span>
                    <span class="weather-desc">
                        <i class="${faIcon}" aria-hidden="true"></i>
                        ${weatherDesc}
                    </span>
                </div>
                <div class="hero-meta">
                    <span>Feels like <strong>${feelsLike}°</strong></span>
                    <span>High <strong>${hi}°</strong></span>
                    <span>Low <strong>${lo}°</strong></span>
                    <span>Observed <strong>${observed}</strong></span>
                </div>
            </section>
        `;
    }

    function buildDetails({ humidity, wind, uv, visibility, pressure, cloudcover }) {
        const tiles = [
            { icon: 'fa-droplet',   label: 'Humidity',   value: `${humidity}%` },
            { icon: 'fa-wind',      label: 'Wind',       value: `${wind} km/h` },
            { icon: 'fa-sun',       label: 'UV Index',   value: uv },
            { icon: 'fa-eye',       label: 'Visibility', value: `${visibility} km` },
            { icon: 'fa-gauge',     label: 'Pressure',   value: `${pressure} hPa` },
            { icon: 'fa-cloud',     label: 'Cloud cover', value: `${cloudcover}%` }
        ];
        const tilesHTML = tiles.map(t => `
            <div class="detail-tile">
                <div class="detail-label"><i class="fa-solid ${t.icon}" aria-hidden="true"></i> ${t.label}</div>
                <div class="detail-value">${t.value}</div>
            </div>
        `).join('');
        return `
            <section>
                <h3 class="section-title">Details</h3>
                <div class="details-grid">${tilesHTML}</div>
            </section>
        `;
    }

    function buildSunRow({ sunrise, sunset, isNight }) {
        return `
            <section>
                <h3 class="section-title">Sun</h3>
                <div class="sun-row">
                    <div class="sun-side sunrise">
                        <span class="sun-label">
                            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Sunrise
                        </span>
                        <span class="sun-time">${sunrise || '—'}</span>
                    </div>
                    <svg class="sun-arc" viewBox="0 0 140 70" aria-hidden="true">
                        <defs>
                            <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%"   stop-color="#f59e0b"/>
                                <stop offset="100%" stop-color="#6366f1"/>
                            </linearGradient>
                        </defs>
                        <path class="sun-arc-track" d="M 10 60 Q 70 -10 130 60"/>
                        <path class="sun-arc-fill"  d="M 10 60 Q 70 -10 130 60"/>
                        <circle class="sun-arc-dot" cx="${isNight ? 130 : 70}" cy="${isNight ? 60 : 5}" r="6"/>
                    </svg>
                    <div class="sun-side sunset">
                        <span class="sun-label">
                            Sunset <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
                        </span>
                        <span class="sun-time">${sunset || '—'}</span>
                    </div>
                </div>
            </section>
        `;
    }

    function buildForecast(weatherDays) {
        const cards = weatherDays.slice(0, 3).map((day, idx) => {
            const date = day.date;
            const max = day.maxtempC;
            const min = day.mintempC;
            const midHour = safe(day, 'hourly', 4) || safe(day, 'hourly', 0) || {};
            const desc = safe(midHour, 'weatherDesc', 0, 'value') || '';
            const icon = getWeatherIconClass(desc, false);
            return `
                <div class="forecast-card">
                    <div class="forecast-day">${formatDay(date, idx)}</div>
                    <i class="${icon} forecast-icon" aria-hidden="true"></i>
                    <div class="forecast-temp">
                        <span class="hi">${max}°</span>
                        <span class="lo">${min}°</span>
                    </div>
                    <div class="forecast-desc">${desc}</div>
                </div>
            `;
        }).join('');
        return `
            <section>
                <h3 class="section-title">3-Day Forecast</h3>
                <div class="forecast-strip">${cards}</div>
            </section>
        `;
    }

    function render(data, fallbackCity) {
        const current = safe(data, 'current_condition', 0);
        const area = safe(data, 'nearest_area', 0);
        const today = safe(data, 'weather', 0);
        const astronomy = safe(today, 'astronomy', 0);

        const cityName = safe(area, 'areaName', 0, 'value') || fallbackCity;
        const region = safe(area, 'region', 0, 'value') || '';
        const country = safe(area, 'country', 0, 'value') || '';

        const temp = current.temp_C;
        const feelsLike = current.FeelsLikeC;
        const humidity = current.humidity;
        const wind = current.windspeedKmph;
        const uv = current.uvIndex;
        const visibility = current.visibility;
        const pressure = current.pressure;
        const cloudcover = current.cloudcover;
        const observed = formatObserved(current.localObsDateTime);
        const iconURL = safe(current, 'weatherIconUrl', 0, 'value') || '';
        const weatherDesc = safe(current, 'weatherDesc', 0, 'value') || '';

        const hi = safe(today, 'maxtempC') || temp;
        const lo = safe(today, 'mintempC') || temp;
        const sunrise = safe(astronomy, 'sunrise');
        const sunset = safe(astronomy, 'sunset');

        const night = isNightNow(current.localObsDateTime, sunrise, sunset);
        const faIcon = getWeatherIconClass(weatherDesc, night);

        setBodyCondition(getConditionClass(weatherDesc, night));

        const html = [
            buildHero({ cityName, region, country, iconURL, weatherDesc, faIcon, temp, feelsLike, hi, lo, observed }),
            buildDetails({ humidity, wind, uv, visibility, pressure, cloudcover }),
            buildSunRow({ sunrise, sunset, isNight: night }),
            buildForecast(safe(data, 'weather') || [])
        ].join('');

        document.querySelector('.display-data').innerHTML = html;
    }

    window.addEventListener('load', function () {
        const form = document.querySelector('#search-form');
        const input = document.querySelector('#city');
        const clearBtn = document.querySelector('#clear-btn');
        const skeleton = document.querySelector('#skeleton');
        const display = document.querySelector('.display-data');
        const error = document.querySelector('.error');

        function updateClearBtn() {
            clearBtn.hidden = input.value.length === 0;
        }
        input.addEventListener('input', updateClearBtn);
        clearBtn.addEventListener('click', () => {
            input.value = '';
            updateClearBtn();
            input.focus();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const city = input.value.trim();
            if (!city) {
                showError(error, 'Please enter a city.');
                return;
            }

            clearError(error);
            display.innerHTML = '';
            skeleton.hidden = false;

            try {
                const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (!safe(data, 'current_condition', 0)) {
                    skeleton.hidden = true;
                    setBodyCondition('');
                    showError(error, `Couldn't find weather for "${city}".`);
                    return;
                }

                skeleton.hidden = true;
                render(data, city);
            } catch (err) {
                console.error(err);
                skeleton.hidden = true;
                setBodyCondition('');
                showError(error, 'Error fetching weather data. Please try again.');
            }
        });
    });
})();
