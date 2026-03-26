var cityEl = document.getElementById("cityInput");
// FIX 1: dropdown now has id="historyDropdown" instead of class="dropdown"
var dropdownEl = $('#historyDropdown');
// FIX 2: input now has id="cityInput" instead of class="search_input"
var inputEl = $("#cityInput");
var searchEl = $("#search");

// Search History Elements
var searchHistoryEl = document.getElementById("searchHistory");

// Weather Feature Elements
// Graph
const ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ["12-5","12-5","12-5","12-5","12-5","12-5"],
        datasets: [{
            label: 'Average',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
            tension: .1,
            borderWidth: 2
        },
        {
            label: 'Max',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgb(255, 0, 0)',
            borderColor: 'rgb(255, 0, 0)',
            tension: .1,
            borderWidth: 2
        },
        {
            label: 'Min',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgb(0, 0, 255)',
            borderColor: 'rgb(0, 0, 255)',
            tension: .1,
            borderWidth: 2
        }]
    },
    options: {
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return value.toFixed(1) + "\u00B0F";
                    }
                }
            }
        }
    }
});

// Extreme Conditions
var featPopEl = document.getElementById("featPop");
var feat3hEl = document.getElementById("feat3h");
var featCloudiEl = document.getElementById("featCloudi");
var featWindSpEl = document.getElementById("featWindSp");
var featWingGustEl = document.getElementById("featWindGust");
var featWindDegEl = document.getElementById("featWindDeg");

// Description
var featDateEl = document.getElementById("featDate");
var featSeaLevelEl = document.getElementById("featSeaLevel");
var featGrndLevelEl = document.getElementById("featGrndLevel");
var featHumidityEl = document.getElementById("featHumidity");
var featWeatherMainEl = document.getElementById("featWeatherMain");
var featWeatherDesEl = document.getElementById("featWeatherDes");

// 6 Day Forecast Elements
var buttonBoxEl = document.getElementsByClassName("buttonBox");
var miniDayEl = document.getElementsByClassName("mini");
var imgEl = document.querySelectorAll("img");
var dateEl = document.getElementsByClassName("date");
var averageEl = document.getElementsByClassName("avg");
var highEl = document.getElementsByClassName("high");
var lowEl = document.getElementsByClassName("low");
var humidityEl = document.getElementsByClassName("humidity");
var windEl = document.getElementsByClassName("wind");

// Base api data unfiltered
var weatherData;
// Organized data based on date
var datedData = {};
// List of all date properties of datedData
var dataDates = [];
// List of all previous searches
var searchHistory = [];


// FIX 3: toggle class is now 'is-open' (was Bulma's 'is-active')
dropdownEl.on('click', function(event) {
    event.stopPropagation();
    dropdownEl.toggleClass('is-open');
});

searchEl.on("click", function(event) {
    var cityInput = inputEl.val().trim();

    getData(cityInput);

    recordSearch(cityInput.charAt(0).toUpperCase() + cityInput.slice(1));
    renderSearch();
    saveSearch();

    unveil();
});

searchHistoryEl.addEventListener("click", function(event) {
    var index = event.target.dataset.index;
    if (index) {
        var cityInput = searchHistory[index];

        getData(cityInput);

        recordSearch(cityInput.charAt(0).toUpperCase() + cityInput.slice(1));
        renderSearch();
        saveSearch();
    }
});

miniDayEl[0].addEventListener("click", setFeature);
miniDayEl[1].addEventListener("click", setFeature);
miniDayEl[2].addEventListener("click", setFeature);
miniDayEl[3].addEventListener("click", setFeature);
miniDayEl[4].addEventListener("click", setFeature);
miniDayEl[5].addEventListener("click", setFeature);

// FIX 4: Maps OpenWeatherMap condition strings to CSS theme classes
function applyWeatherTheme(weatherMain) {
    var themeMap = {
        'Clear':         'theme-sunny',
        'Rain':          'theme-rainy',
        'Drizzle':       'theme-rainy',
        'Clouds':        'theme-overcast',
        'Thunderstorm':  'theme-stormy',
        'Snow':          'theme-snow',
        'Mist':          'theme-overcast',
        'Fog':           'theme-overcast',
        'Haze':          'theme-overcast',
        'Smoke':         'theme-overcast',
        'Dust':          'theme-overcast',
        'Sand':          'theme-overcast',
        'Ash':           'theme-overcast',
        'Squall':        'theme-stormy',
        'Tornado':       'theme-stormy'
    };
    var themeClass = themeMap[weatherMain] || '';
    // Replace all theme-* classes on body, leave any others intact
    document.body.className = document.body.className
        .replace(/\btheme-\S+/g, '')
        .trim();
    if (themeClass) {
        document.body.classList.add(themeClass);
    }
}

function setFeature(event) {
    var index;
    if (typeof event === "number") {
        index = event;
    } else {
        index = event.currentTarget.dataset.index;
    }

    var date = dataDates[index];
    var currentData = datedData[date];

    var labels = [];
    var dataTemp = [];
    var dataMax = [];
    var dataMin = [];
    for (var i = 0; i < currentData.length; i++) {
        labels.push(currentData[i].dt_txt.substring(11, 16));
        dataTemp.push(currentData[i].main.temp);
        dataMax.push(currentData[i].main.temp_max);
        dataMin.push(currentData[i].main.temp_min);
    }

    myChart.data.labels = labels;
    myChart.data.datasets[0].data = dataTemp;
    myChart.data.datasets[1].data = dataMax;
    myChart.data.datasets[2].data = dataMin;
    myChart.update();

    var weatherMain = currentData[0].weather[0].main;

    // FIX 4 cont: apply theme whenever a day is selected
    applyWeatherTheme(weatherMain);

    // Setting Extreme Conditions
    featPopEl.textContent = "Probability of Precipitation: " + (currentData[0].pop * 100).toFixed(0) + "%";
    featCloudiEl.textContent = "Cloudiness: " + currentData[0].clouds.all + "%";
    featWindSpEl.textContent = "Wind Speed: " + currentData[0].wind.speed + " mi/hr";
    featWingGustEl.textContent = "Wind Gust: " + currentData[0].wind.gust + " mi/hr";
    featWindDegEl.textContent = "Wind Direction: " + currentData[0].wind.deg + "\u00B0";

    if (weatherMain === "Rain") {
        feat3hEl.textContent = "3 Hour Volume: " + currentData[0].rain["3h"] + " mm";
    } else if (weatherMain === "Snow") {
        feat3hEl.textContent = "3 Hour Volume: " + currentData[0].snow["3h"] + " mm";
    } else {
        feat3hEl.textContent = "";
    }

    // Setting Feature Description
    featDateEl.textContent = date;
    featSeaLevelEl.textContent = "Pressure at Sea Level: " + currentData[0].main.sea_level + " hPa";
    featGrndLevelEl.textContent = "Pressure at Ground Level: " + currentData[0].main.grnd_level + " hPa";
    featHumidityEl.textContent = "Percent Humidity: " + currentData[0].main.humidity + "%";
    featWeatherMainEl.textContent = "Main Weather: " + weatherMain;
    featWeatherDesEl.textContent = "Weather Description: " + currentData[0].weather[0].description;
}

function getData(input) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + input + "&appid=31ed1d78ece05a26dbb0c6020e7b32b5";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    weatherData = data;
                    renderPage();
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Did not get a response");
        });
}

function renderPage(data) {
    cityEl.textContent = weatherData.city.name + ", " + weatherData.city.country;

    organizeData();
    setFeature(0);

    if (dataDates.length === 5) {
        miniDayEl[5].classList.add("veil");
    } else {
        miniDayEl[5].classList.remove("veil");
    }

    for (var i = 0; i < dataDates.length; i++) {
        var currentTemp = datedData[dataDates[i]][0].main;
        var current = datedData[dataDates[i]][0];

        averageEl[i].textContent = currentTemp.temp + "\u00B0F";
        highEl[i].textContent = "High: " + currentTemp.temp_max + "\u00B0F";
        lowEl[i].textContent = "Low: " + currentTemp.temp_min + "\u00B0F";
        humidityEl[i].textContent = "Humidity: " + currentTemp.humidity + "%";

        dateEl[i].textContent = current.dt_txt.substring(5, 10);
        windEl[i].textContent = "Wind: " + current.wind.speed + "MPH";

        imgEl[i].src = "assets/images/" + current.weather[0].main + ".jpg";
    }
}

function recordSearch(input) {
    var index = searchHistory.indexOf(input);
    if (index > -1) {
        searchHistory.splice(index, 1);
    }
    searchHistory.unshift(input);
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }
}

function renderSearch() {
    searchHistoryEl.innerHTML = "";
    for (var i = 0; i < searchHistory.length; i++) {
        searchHistoryEl.insertAdjacentHTML("beforeend", `<a class="dropdown-item" data-index=${i}>${searchHistory[i]}</a>`);
    }
}

function saveSearch() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function loadSearch() {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory === null) {
        searchHistory = [];
    }
}

function organizeData() {
    // Reset before re-organizing to avoid stale data accumulating across searches
    datedData = {};
    dataDates = [];

    weatherData.list.forEach(element => {
        var currentDate = element.dt_txt.substring(0, 10);
        if (!(currentDate in datedData)) {
            datedData[currentDate] = [];
            dataDates.push(currentDate);
        }
        datedData[currentDate].push(element);
    });
}

function saveDataLocal() {
    localStorage.setItem("TEST", JSON.stringify(weatherData));
}

function loadDataLocal() {
    weatherData = JSON.parse(localStorage.getItem("TEST"));
}

function unveil() {
    var hiddenEl = document.getElementsByClassName("veil");
    for (var i = hiddenEl.length - 1; i >= 0; i--) {
        hiddenEl[i].classList.remove("veil");
    }
}

myChart.resize(20, 20);
loadSearch();
renderSearch();
loadDataLocal();