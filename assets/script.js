var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var searchEl = $("#search");

var buttonBoxEl = document.getElementsByClassName("buttonBox");

const ctx = document.getElementById('myChart');

var featDateEl = document.getElementsByClassName("featDate");
const data = {
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};

var miniDayEl = document.getElementsByClassName("mini");

var imgEl = document.querySelectorAll("img");
var dateEl = document.getElementsByClassName("date");
var averageEl = document.getElementsByClassName("avg");
var highEl = document.getElementsByClassName("high");
var lowEl = document.getElementsByClassName("low");
var humidityEl = document.getElementsByClassName("humidity");
var windEl = document.getElementsByClassName("wind");
var weatherMainEl = document.getElementsByClassName("WeatherMain");
var weatherDesEl = document.getElementsByClassName("WeatherDes");

var dataDates = [];
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

miniDayEl[0].addEventListener("click", setFeature);
miniDayEl[1].addEventListener("click", setFeature);
miniDayEl[2].addEventListener("click", setFeature);
miniDayEl[3].addEventListener("click", setFeature);
miniDayEl[4].addEventListener("click", setFeature);

function setFeature(event) {
    console.log(event.currentTarget.dataset.index);
    var index = event.currentTarget.dataset.index;
    var date = dataDates[index];
    var currentData = datedData[date];
    featDateEl[0].textContent = date;

    const chartInteractionModeNearest = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data: [0, 0],
            }, {
                data: [0, 1]
            }, {
                data: [1, 0],
                showLine: true // overrides the `line` dataset default
            }
            ]
        }
    });
}

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
    organizeData();
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
        
        weatherMainEl[i].textContent = current.weather[0].main;
        weatherDesEl[i].textContent = current.weather[0].description; 
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

function resetMiniColor() {
    
}

loadDataLocal();
organizeData();