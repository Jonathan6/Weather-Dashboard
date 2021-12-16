var cityEl = document.getElementById("city");
var dropdownEl = $('.dropdown');
var inputEl = $(".input");
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
                    // Include a dollar sign in the ticks
                    callback: function(value) {
                        return value.toFixed(1)  + "\u00B0F";
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

// 6 Day Forcast Elements
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
// List of all date properites of datedData
var dataDates = [];
// List of all previous searches
var searchHistory = [];


dropdownEl.on('click', function(event) {
  event.stopPropagation();
  dropdownEl.toggleClass('is-active');
});

searchEl.on("click", function(event) {
    var cityInput = inputEl.val().trim();

    getData(cityInput);

    recordSearch(cityInput.charAt(0).toUpperCase() + cityInput.slice(1));
    renderSearch();
    saveSearch();
});

searchHistoryEl.addEventListener("click", function(event) {
    var index = event.target.dataset.index
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

// Function called by mini day event listeners to set the feature
// Not functional yet shouldn't call it 
function setFeature(event) {
    // The index in dataDates of the miniDay we clicked
    var index;
    if (typeof event === "number") {
        index = event;
    } else {
        index = event.currentTarget.dataset.index;
    }
    // Convert to the actual date string
    var date = dataDates[index];
    // Accessing the data within datedData
    var currentData = datedData[date];

    // Making the arrays for new data and labels
    var labels = [];
    var dataTemp = [];
    var dataMax = [];
    var dataMin = [];
    for (var i = 0; i < currentData.length; i++) {
        labels.push(currentData[i].dt_txt.substring(11,16))  ;
        dataTemp.push(currentData[i].main.temp);
        dataMax.push(currentData[i].main.temp_max);
        dataMin.push(currentData[i].main.temp_min);
    }

    // Updating the chart with new data and labels
    myChart.data.labels = labels;
    myChart.data.datasets[0].data = dataTemp;
    myChart.data.datasets[1].data = dataMax;
    myChart.data.datasets[2].data = dataMin;
    myChart.update();

    var weatherMain = currentData[0].weather[0].main;

    // Setting Extreme Conditions
    featPopEl.textContent = "Probability of Precipitation: " + (currentData[0].pop * 100).toFixed(0) + "%";
    featCloudiEl.textContent = "Cloudiness: " + currentData[0].clouds.all + "%";
    featWindSpEl.textContent = "Wind Speed: " + currentData[0].wind.speed + " mi/hr";
    featWingGustEl.textContent = "Wind Gust: " + currentData[0].wind.gust + " mi/hr";
    featWindDegEl.textContent = "Wind Direction" + currentData[0].wind.deg + "\u00B0";

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

// Called by the search button with whatever is in the input val
// Retrieves the data from the weather api
// Sets weatherData varibale to api data nad renders the rest of the page
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
            alert("Did not get a resposne");
        });
};

// function takes in organized data and renders the webpage by date
function renderPage(data) {
    cityEl.textContent = weatherData.city.name + ", " + weatherData.city.country;

    organizeData();
    setFeature(0);

    for (var i = 0; i < dateEl.length; i++) {
        var currentTemp = datedData[dataDates[i]][0].main;
        var current = datedData[dataDates[i]][0];

        averageEl[i].textContent = currentTemp.temp + "\u00B0F";
        highEl[i].textContent = "High: " + currentTemp.temp_max + "\u00B0F";
        lowEl[i].textContent = "Low: " + currentTemp.temp_min + "\u00B0F";
        humidityEl[i].textContent = "Humidity: " + currentTemp.humidity + "%";

        dateEl[i].textContent = current.dt_txt.substring(5,10);
        windEl[i].textContent = "Wind: " + current.wind.speed + "MPH";

        imgEl[i].src = "assets/images/" + current.weather[0].main + ".jpg"
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

// Organizes api weather data into datedData based on date
// Also adds all the dates to dataDates so I know how to traverse datedData
function organizeData() {
    // For loop that goes through all elements in data
    weatherData.list.forEach(element => {
        var currentDate = element.dt_txt.substring(0,10);
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

myChart.resize(20,20);
loadSearch();
renderSearch();
loadDataLocal();