var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var searchEl = $("#search");
var buttonBoxEl = $(".buttonBox");

var dateEl = document.getElementsByClassName("date");
var averageEl = document.getElementsByClassName("avg");
var highEl = document.getElementsByClassName("high");
var lowEl = document.getElementsByClassName("low");
var humidityEl = document.getElementsByClassName("humidity");
var windEl = document.getElementsByClassName("wind");
var precipitationEl = document.getElementsByClassName("precipitation");

var weatherData;
var datedData = {};
var searchHistory = [];


dropdownEl.on('click', function(event) {
  event.stopPropagation();
  dropdownEl.toggleClass('is-active');
});

searchEl.on("click", function(event) {
    weatherData = getData(inputEl.val().trim());
});

buttonBoxEl.on("click", function(event) {
    console.log(event);
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
    for (var i = 0; i < dateEl.length; i++) {
        var currentTemp = data.list[i].main;
        var current = data.list[i];

        averageEl[i].textContent = currentTemp.temp + "\u00B0F";
        highEl[i].textContent = "High: " + currentTemp.temp_max + "\u00B0F";
        lowEl[i].textContent = "Low: " + currentTemp.temp_min + "\u00B0F";
        humidityEl[i].textContent = "Humidity: " + currentTemp.humidity + "%";

        dateEl[i].textContent = current.dt_txt.substring(0,10);
        windEl[i].textContent = "Wind: " + current.wind.speed + "MPH";
        // TODO: adding in precipitation and dealing with non guarenteed data
        // if (current.rain["3h"] !== undefined) {
        //     precipitationEl[i].textContent = ("Precipitation: " + current.rain["3h"] + "%");
        // } else {
        //     precipitationEl[i].textContent = ("Precipitation: 0%");
        // }
    }
}

function recordSearch(input) {
    searchHistory.push(input);
    if (searchHistory.length > 5) {
        searchHistory.shift();
    }
    localStorage.setItem("history", searchHistory);
}

function unixToDate(unix) {
    let unix_timestamp = unix;
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

// Organizes api weather data based on date
function organizeData() {
    // For loop that goes through all elements in data
    weatherData.list.forEach(element => {
        var currentDate = element.dt_txt.substring(0,10);
        if (!(currentDate in datedData)) {
            datedData[currentDate] = [];
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

loadDataLocal();