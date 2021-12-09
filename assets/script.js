var dropdownEl = $('.dropdown');
var inputEl = $(".input");
var buttonEl = $(".button");

var weatherEl = $("#0");

var data2;

dropdownEl.on('click', function(event) {
  event.stopPropagation();
  dropdownEl.toggleClass('is-active');
});

buttonEl.on("click", function(event) {
    data2 = getData(inputEl.val().trim());
    console.log(data2);
    // renderPage(data);
});

function getData(input) {
    var apiUrl = "http://api.openweathermap.org/data/2.5/forecast?units=imperial&q=" + input + "&appid=31ed1d78ece05a26dbb0c6020e7b32b5";
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    return(data);
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
    $("#avg").text(current.temp);
    $("#high").text(current.temp_max);
    $("#low").text(current.temp_low);
}