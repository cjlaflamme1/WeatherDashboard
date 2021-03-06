$(document).ready(function () {
    // API Keys and their documentation
    // https://openweathermap.org/api/one-call-api#how
    const weatherApiKey = "95f8c20b3dbfd6ef88b8d05477161fb2";
    //    https://opencagedata.com/api
    const geocodeApiKey = "09139eed245840c0ae1f7e7e3ed56de8";
    // All of the current weather hooks
    const currentDate = moment().format('L');
    const cityAndDate = $('h2.cityDateValue');
    const currentIcon = $('img.currentWeatherIcon');
    const currentTemp = $('span.currentTempValue');
    const currentHumidity = $('span.currentHumidityValue');
    const currentWind = $('span.currentWindSpeedValue');
    const currentUV = $('span.currentUVIndexValue');
    // All of the forecast hooks
    const forecastContent = $('div.forecastContent');
    const forecastDate = $('h6.forecastDate');
    const forecastIcon = $('img.forecastPic');
    const forecastTemp = $('span.tempValue');
    const forecastHumidity = $('span.humidityValue');
    // Establish search history for buttons
    let searchHistory = JSON.parse(window.localStorage.getItem('searchHistory')) || [];
    // Button creation for the search history
    const buttonRow = $('div.buttonRow');
    function renderButtons() {
        $(buttonRow).empty();
        searchHistory.forEach(function (item) {
            const historyButton = $('<button>').addClass('btn btn-light btn-lg btn-block historyButton');
            historyButton.attr('data-lat', item.lat).attr('data-long', item.long).attr('value', item.value).text(item.value);
            buttonRow.prepend(historyButton);
        })
        // Populates the most recent weather information if a prior search existed.  
        if (searchHistory.length > 0) {
            const item = (searchHistory.length - 1);
            const lat = searchHistory[item].lat;
            const long = searchHistory[item].long;
            const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude={part}&appid=${weatherApiKey}&units=imperial`;
            // the AJAX get request for the previous search button. 
            $.get(weatherURL).then(function (returnedWeather) {
                const { current: { humidity, temp, wind_speed, uvi, weather: { [0]: { icon } } }, daily } = returnedWeather;
                cityAndDate.text(`${searchHistory[item].value} (${currentDate})`);
                currentIcon.attr('src', `https://openweathermap.org/img/wn/${icon}@2x.png`)
                currentTemp.text(Math.floor(parseInt(temp)));
                currentHumidity.text(humidity);
                currentWind.text(wind_speed);
                const uviInt = parseInt(uvi);
                currentUV.text(uviInt);
                if (uviInt <= 2) {
                    $(currentUV).css({"background-color": "green", "color": "white"});
                } else if (uviInt <= 5) {
                    $(currentUV).css({"background-color": "yellow", "color":"black"});
                } else if (uviInt <= 7) {
                    $(currentUV).css({ "background-color": "orange", "color": "white" });
                } else if (uviInt <= 10) {
                    $(currentUV).css({"background-color": "red", "color": "white"});
                } else if (uviInt >= 11) {
                    $(currentUV).css({"background-color": "purple", "color": "white"});
                }

                forecastContent.each(function (forecastDay) {
                    $(forecastDate[forecastDay]).text(moment().add(forecastDay, 'days').format('ddd'));
                    $(forecastIcon[forecastDay]).attr("src", `https://openweathermap.org/img/wn/${daily[forecastDay].weather[0].icon}@2x.png`);
                    $(forecastTemp[forecastDay]).text(Math.floor(parseInt(daily[forecastDay].temp.day)));
                    $(forecastHumidity[forecastDay]).text(daily[forecastDay].humidity);
                })
            })
        }
    }
    renderButtons();
    $('button.weatherSubmit').on("click", function (event) {
        event.preventDefault();
        // takes the value of the weather input.
        const locationInput = $('input').val();
        $('input').val("");
        // Grabs the Lat/Long of the input location.
        const queryURL = `https://api.opencagedata.com/geocode/v1/json?q=${locationInput}&key=${geocodeApiKey}`;
        // Querys the geocode API
        $.get(queryURL).then(function (returnedLatLong) {
            const { results: { [0]: { formatted, geometry: { lat, lng } } } } = returnedLatLong;
            const weatherLocation = formatted;
            const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude={part}&appid=${weatherApiKey}&units=imperial`;
            // Uses newly acquired lat/long to find weather for the location.
            $.get(weatherURL).then(function (returnedWeather) {
                const { current: { humidity, temp, wind_speed, uvi, weather: { [0]: { icon } } }, daily } = returnedWeather;
                cityAndDate.text(`${weatherLocation} (${currentDate})`);
                currentIcon.attr('src', `https://openweathermap.org/img/wn/${icon}@2x.png`)
                currentTemp.text(Math.floor(parseInt(temp)));
                currentHumidity.text(humidity);
                currentWind.text(wind_speed);
                const uviInt = parseInt(uvi);
                currentUV.text(uviInt);
                if (uviInt <= 2) {
                    $(currentUV).css({"background-color": "green", "color": "white"});
                } else if (uviInt <= 5) {
                    $(currentUV).css({"background-color": "yellow", "color":"black"});
                } else if (uviInt <= 7) {
                    $(currentUV).css({ "background-color": "orange", "color": "white" });
                } else if (uviInt <= 10) {
                    $(currentUV).css({"background-color": "red", "color": "white"});
                } else if (uviInt >= 11) {
                    $(currentUV).css({"background-color": "purple", "color": "white"});
                }

                // loops over the forecast divs and inputs forecast for each item.
                forecastContent.each(function (forecastDay) {
                    $(forecastDate[forecastDay]).text(moment().add(forecastDay, 'days').format('ddd'));
                    $(forecastIcon[forecastDay]).attr("src", `https://openweathermap.org/img/wn/${daily[forecastDay].weather[0].icon}@2x.png`);
                    $(forecastTemp[forecastDay]).text(Math.floor(parseInt(daily[forecastDay].temp.day)));
                    $(forecastHumidity[forecastDay]).text(daily[forecastDay].humidity);
                })
                // generates button based on the search and adds to the search history. 
                const historyButton = $('<button>').addClass('btn btn-light btn-lg btn-block historyButton');
                searchHistory.push({ value: weatherLocation, lat: lat, long: lng });
                window.localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                historyButton.attr('data-lat', lat).attr('data-long', lng).attr('value', weatherLocation).text(weatherLocation);
                buttonRow.prepend(historyButton);
            })
        })
    })
    // this listener looks out for clicks on buttons that may not yet exist, but are the search history buttons. 
    $(document).on("click", "button.historyButton", function (event) {
        event.preventDefault();
        const targetButton = event.target;
        const lat = $(targetButton).attr('data-lat');
        const long = $(targetButton).attr('data-long');
        const weatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude={part}&appid=${weatherApiKey}&units=imperial`;
        // the AJAX get request for the previous search button. 
        $.get(weatherURL).then(function (returnedWeather) {
            const { current: { humidity, temp, wind_speed, uvi, weather: { [0]: { icon } } }, daily } = returnedWeather;
            cityAndDate.text(`${targetButton.value} (${currentDate})`);
            currentIcon.attr('src', `https://openweathermap.org/img/wn/${icon}@2x.png`)
            currentTemp.text(Math.floor(parseInt(temp)));
            currentHumidity.text(humidity);
            currentWind.text(wind_speed);
            const uviInt = parseInt(uvi);
            currentUV.text(uviInt);
            if (uviInt <= 2) {
                $(currentUV).css({"background-color": "green", "color": "white"});
            } else if (uviInt <= 5) {
                $(currentUV).css({"background-color": "yellow", "color":"black"});
            } else if (uviInt <= 7) {
                $(currentUV).css({ "background-color": "orange", "color": "white" });
            } else if (uviInt <= 10) {
                $(currentUV).css({"background-color": "red", "color": "white"});
            } else if (uviInt >= 11) {
                $(currentUV).css({"background-color": "purple", "color": "white"});
            }

            forecastContent.each(function (forecastDay) {
                $(forecastDate[forecastDay]).text(moment().add(forecastDay, 'days').format('ddd'));
                $(forecastIcon[forecastDay]).attr("src", `https://openweathermap.org/img/wn/${daily[forecastDay].weather[0].icon}@2x.png`);
                $(forecastTemp[forecastDay]).text(Math.floor(parseInt(daily[forecastDay].temp.day)));
                $(forecastHumidity[forecastDay]).text(daily[forecastDay].humidity);
            })
        })
    })
})