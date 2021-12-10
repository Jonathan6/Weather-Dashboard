var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var searchEl = $("#search");

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
    getData(inputEl.val().trim());
});

function getData(input) {
    recordSearch(input);
    var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + input + "&appid=31ed1d78ece05a26dbb0c6020e7b32b5";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    renderPage(data);
                    weatherData = data;
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
    var current = data.list[0].main;
    var rain = data.list[0].rain;
    averageEl[0].textContent = current.temp + "\u00B0C";
    highEl[0].textContent = "High: " + current.temp_max + "\u00B0C";
    lowEl[0].textContent = "Low: " + current.temp_min + "\u00B0C";
    humidityEl[0].textContent = "Humidity: " + current.humidity + "%";
    windEl[0].textContent = "Wind: " + data.list[0].wind.speed + "MPH";
    // $("#Precipitation").text("Precipitation: " + rain["3h"] + "%");
}

function recordSearch(input) {
    searchHistory.push(input);
    if (searchHistory.length > 5) {
        searchHistory.shift();
    }
    localStorage.setItem("history", searchHistory);
}