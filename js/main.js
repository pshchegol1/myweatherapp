window.addEventListener('load',function(e)
{
    const form = document.querySelector('form');
    const error = document.querySelector('.error');

    
  

      form.addEventListener('submit', (e)=>{


       
        e.preventDefault();

        const city = document.querySelector('#city').value.trim();

        console.log(city);



        //Validation
        if(city === "")
        {
            error.classList.add('show');
            error.innerHTML = "Enter City Please!";
            form.reset();
        }
        else
        {
            fetch(`https://wttr.in/${city}?format=j1`)
            .then((response) => response.json())
            .then(function(data) {
                // Check if the API returned an error (wttr.in returns valid JSON even for unknown cities, but may have empty arrays)
                if (!data.current_condition || !data.current_condition[0]) {
                    error.classList.add('show');
                    error.innerHTML = "Incorrect City!";
                    form.reset();
                    return;
                }

                const current = data.current_condition[0];
                const area = data.nearest_area && data.nearest_area[0] ? data.nearest_area[0] : null;
                const region = area && area.region && area.region[0] ? area.region[0].value : 'Unknown';
                const country = area && area.country && area.country[0] ? area.country[0].value : '';
                const cityName = area && area.areaName && area.areaName[0] ? area.areaName[0].value : city;
                const dayhour = current.localObsDateTime || '';
                const temp = current.temp_C;
                const humidity = current.humidity;
                const wind = current.windspeedKmph;
                const iconURL = current.weatherIconUrl && current.weatherIconUrl[0] ? current.weatherIconUrl[0].value : '';
                const weatherDesc = current.weatherDesc && current.weatherDesc[0] ? current.weatherDesc[0].value : '';

                // Map weather description to Font Awesome icon classes
                function getWeatherIconClass(desc) {
                    desc = desc.toLowerCase();
                    if(desc.includes('rain') || desc.includes('drizzle')) return 'fa-solid fa-cloud-showers-heavy text-primary';
                    if(desc.includes('thunder')) return 'fa-solid fa-bolt text-warning';
                    if(desc.includes('snow') || desc.includes('sleet') || desc.includes('blizzard')) return 'fa-solid fa-snowflake text-info';
                    if(desc.includes('clear') || desc.includes('sunny')) return 'fa-solid fa-sun text-warning';
                    if(desc.includes('cloud') || desc.includes('overcast')) return 'fa-solid fa-cloud text-secondary';
                    if(desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return 'fa-solid fa-smog text-muted';
                    if(desc.includes('wind')) return 'fa-solid fa-wind text-info';
                    return 'fa-solid fa-cloud-sun text-info';
                }

                const faIcon = getWeatherIconClass(weatherDesc);

                let output = `
                    <div class="weather-card glassmorphism mt-4 mb-4 mx-auto animate__animated animate__fadeInUp">
                        <div class="weather-header d-flex align-items-center justify-content-center">
                            <img class="weather-icon me-3" src="${iconURL}" alt="Weather Icon">
                            <div>
                                <h2 class="city-name mb-0">${cityName}</h2>
                                <div class="region-country">${region}, ${country}</div>
                            </div>
                        </div>
                        <div class="weather-main mt-3 mb-2">
                            <span class="temp display-3 fw-bold">${temp}°C</span>
                            <span class="weather-desc ms-2 fs-4">
                                <i class="${faIcon}" style="vertical-align: middle;"></i> ${weatherDesc}
                            </span>
                        </div>
                        <div class="weather-details row text-center mt-3">
                            <div class="col">
                                <div class="detail-label">
                                    <i class="fa-solid fa-droplet text-info me-1"></i> Humidity
                                </div>
                                <div class="detail-value">${humidity}%</div>
                            </div>
                            <div class="col">
                                <div class="detail-label">
                                    <i class="fa-solid fa-wind text-primary me-1"></i> Wind
                                </div>
                                <div class="detail-value">${wind} km/h</div>
                            </div>
                            <div class="col">
                                <div class="detail-label">
                                    <i class="fa-regular fa-clock text-secondary me-1"></i> Observed
                                </div>
                                <div class="detail-value">${dayhour}</div>
                            </div>
                        </div>
                    </div>
                `;
                document.querySelector('.display-data').innerHTML = output;
                error.classList.remove('show');
            })
            .catch(function(err) {
                console.log(err);
                error.classList.add('show');
                error.innerHTML = "Error fetching weather data.";
            });
            form.reset();
        
      
      }  })

})