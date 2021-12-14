var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var searchEl = $("#search");

var buttonBoxEl = document.getElementsByClassName("buttonBox");

const ctx = document.getElementById('myChart');

var myChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ["12-5","12-5","12-5","12-5","12-5","12-5"],
        datasets: [{
            label: 'My First Dataset',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
            tension: .1,
            borderWidth: 2
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

myChart.resize(20,20);

var featDateEl = document.getElementsByClassName("featDate");

var featDateEl = document.getElementById("featDate");

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
    if (inputEl.val().trim() !== "") {
        getData(inputEl.val().trim());
    }
});

miniDayEl[0].addEventListener("click", setFeature);
miniDayEl[1].addEventListener("click", setFeature);
miniDayEl[2].addEventListener("click", setFeature);
miniDayEl[3].addEventListener("click", setFeature);
miniDayEl[4].addEventListener("click", setFeature);

// Function called by mini day event listeners to set the feature
// Not functional yet shouldn't call it 
function setFeature(event) {
    // The index in dataDates of the miniDay we clicked
    var index = event.currentTarget.dataset.index;
    // Convert to the actual date string
    var date = dataDates[index];
    // Accessing the data within datedData
    var currentData = datedData[date];
    featDateEl.textContent = date;

    // Updating the chart with new data and labels
    myChart.data.labels = ["new labels"];
    myChart.data.datasets[0].data = [13,14,15,12,14,18];
    myChart.update();
}

// Called by the search button with whatever is in the input val
// Retrieves the data from the weather api
// Sets weatherData varibale to api data nad renders the rest of the page
function getData(input) {
    recordSearch(input);
    var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + input + "&appid=31ed1d78ece05a26dbb0c6020e7b32b5";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
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

// function takes in organized data and renders the webpage by date
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

loadDataLocal();
renderPage();