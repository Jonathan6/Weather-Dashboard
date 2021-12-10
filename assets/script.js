var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var searchEl = $("#search");

var dateEl = document.getElementsByClassName("date");
var averageEl = document.getElementsByClassName("avg");
var highEl = document.getElementsByClassName("high");
var lowEl = document.getElementsByClassName("low");
var humidityEl = document.getElementsByClassName("humidity");
var windEl = document.getElementsByClassName("wind");


var weatherData;
var searchHistory = [];

dropdownEl.on('click', function(event) {
  event.stopPropagation();
  dropdownEl.toggleClass('is-active');
});

searchEl.on("click", function(event) {
    weatherData = getData(inputEl.val().trim());
});

function getData(input) {
    recordSearch(input);
    var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + input + "&appid=31ed1d78ece05a26dbb0c6020e7b32b5";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    renderPage(data);
                    console.log(data);
                    return data;
                });
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Did not get a resposne");
        });
};

function renderPage(data) {
    for (var i = 0; i < dateEl.length; i++) {
        var currentTemp = data.list[i].main;
        var current = data.list[i];

        averageEl[i].textContent = currentTemp.temp + "\u00B0C";
        highEl[i].textContent = "High: " + currentTemp.temp_max + "\u00B0C";
        lowEl[i].textContent = "Low: " + currentTemp.temp_min + "\u00B0C";
        humidityEl[i].textContent = "Humidity: " + currentTemp.humidity + "%";
        
        dateEl[i].textContent = current.dt_txt.substring(5,10);
        windEl[i].textContent = "Wind: " + current.wind.speed + "MPH";
        // prec("Precipitation: " + rain["3h"] + "%");
    }
}

function recordSearch(input) {
    searchHistory.push(input);
    if (searchHistory.length > 5) {
        searchHistory.shift();
    }
    localStorage.setItem("history", searchHistory);
}

