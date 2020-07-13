//DONE: FIX CIRCLE ANIMATION ON CLICK.
//DONE: ADD Search functionality for table.
//DONE: Add search functionality for MAP.
//TODO: Keep aspect ratio for search icon when not expanded
//TODO: Create Loading screen
//TODO: Fix size of infection circles on map
//TODO: Finalize styling on buttom part of page
//TODO: ADD FUNCTIONALITY TO CHART (SEE DEATH CURVE, RECOVERY CURVE ETC.)
var map;
var i = 0;
var data;


document.addEventListener("DOMContentLoaded", function () {
    //The first argument are the elements to which the plugin shall be initialized
    //The second argument has to be at least a empty object or a object with your desired options
    OverlayScrollbars(document.querySelectorAll('body'), {
        className: 'os-theme-dark',
        scrollbars: {
            clickScrolling: true,
            autoHide: 'scroll',
            touchSupport: true,
        },
        resize: 'both',
    });
    OverlayScrollbars(document.getElementById('country-table'), {
        className: 'os-theme-dark',
        scrollbars: {
            clickScrolling: true,
            autoHide: 'scroll',
            touchSupport: true,
        },
        resize: 'both',
    });

});

window.onload = () => {
    getCountryData();
    buildChart();
    getHistoricalData();
}

const animateSearchBar = (data) => {
    
    let searchBtn = document.getElementById('search-btn');
    let searchContainer = document.getElementById('search-container-start');
    let search = document.getElementById('search');
    let tip = document.getElementById('tip');

    searchBtn.addEventListener('click', () => {
        //Change id of search container to remove expanding circle animation on click. 
        searchContainer.id = 'search-container';
        searchContainer = document.getElementById('search-container');
        search.style.width = '30%';
        searchContainer.style.width = '30%';
        searchBtn.style.marginRight = '103%';
        search.style.cursor = 'text';
        search.focus();
        typeWriter();
    })

    search.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchCountry(data);
        }
        tip.style.visibility = 'visible';
        tip.style.opacity = '1';
    });
}

const searchCountry = (data) => {
    //Get value and ensure the input is identical to the API data.
    var countryInput = document.getElementById('search').value;
    var countryFound = -1;
    var countryLow = countryInput.toLowerCase();
    data.map((country) => {
        var countryString = country.country.toLowerCase();
        if (countryLow.localeCompare(countryString) == 0) {
            countryFound = 1;
            let countryCenter = {
                lat: country.countryInfo.lat,
                lng: country.countryInfo.long
            }
            map.panTo(countryCenter);
        }
    })
    if (countryFound != 1) {
        alert(`"${countryInput}" is not a country`);
    }
}

function searchTable() {
    //Convert input for comparison with table
    var input, filter, found, table, tableBody, tableHead, ths, trBody, td, i, j;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("main-table");
    //Head
    tableHead = document.getElementsByTagName("thead")[0];
    ths = tableHead.getElementsByTagName("th");
    //Body
    tableBody = document.getElementsByTagName("tbody")[0];
    trBody = tableBody.getElementsByTagName("tr");
    //If found remove everything but what matches with the found value
    for (i = 0; i < trBody.length; i++) {
        td = trBody[i].getElementsByTagName("td");
        for (j = 0; j < td.length; j++) {
            if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
                found = true;
            }
        }
        if (found) {
            trBody[i].style.display = "";
            found = false;
            //Maintain border radius on table
            table.style.borderRadius = "10px";
            //Bug fix: removes black line at top of table.
            ths.forEach((th) => {
                th.style.borderTopWidth = "0px";
            })
        } else {
            trBody[i].style.display = "none";
        }
    }
}


const typeWriter = () => {
    var search = document.getElementById('search');
    let message = 'Enter a Country';
    let typeWriterSpeed = 100;
    if (i < message.length) {
        msg = search.getAttribute('placeholder') + message.charAt(i)
        search.setAttribute('placeholder', msg)
        i++;
        setTimeout(typeWriter, typeWriterSpeed)
    }
}


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 54,
            lng: 25
        },
        zoom: 4,
        styles: mapStyle,
    });
    infoWindow = new google.maps.InfoWindow({});
}


const getHistoricalData = () => {
    fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=120")
        .then((response) => {
            return response.json()
        }).then((data) => {
            let chartData = buildChartData(data);
            buildChart(chartData);
        })
}

const buildChartData = (data) => {
    let chartData = [];
    for (let date in data.cases) {
        let newDataPoint = {
            x: date,
            y: data.cases[date],
        }
        chartData.push(newDataPoint);
    }
    return chartData;
}


const buildChart = (chartData) => {
    var ctx = document.getElementById('cases-chart').getContext('2d');
    var timeFormat = 'MM/DD/YYYY'
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            datasets: [{
                label: 'Total Number of Cases',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: chartData
            }]
        },

        //Configuration options
        options: {
            toolstips: {
                mode: 'index',
                intersect: false
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: function (value, index, values) {
                            return numeral(value).format('0,0');
                        }
                    }
                }]
            }
        }
    });
}



async function getCountryData() {
    const response = await fetch("https://corona.lmao.ninja/v2/countries")
    var data = await response.json();
    showDataOnMap(data);
    showDataInTable(data);
    animateSearchBar(data);
    return data;    
}

const showDataOnMap = (data) => {

    data.map((country) => {
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        var countryCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: countryCenter,
            radius: country.casesPerOneMillion * 15
        });

        var html = `
        <div class="info-container">
            <div class="info-flag"> 
                <img src="${country.countryInfo.flag}" />
            </div>
            <div class="info-name">
            ${country.country}
            </div>
            <div class="info-confirmed">
            Total: ${country.cases}
            </div>
            <div class="info-recovered">
            Recovered: ${country.recovered}
            </div>
            <div class="info-deaths">
            Deaths: ${country.deaths}
            </div>
        </div>
        `

        var infoWindow = new google.maps.InfoWindow({
            content: html,
            position: countryCircle.center,
        });

        google.maps.event.addListener(countryCircle, 'mouseover', function () {
            infoWindow.open(map);
        });

        google.maps.event.addListener(countryCircle, 'mouseout', function () {
            infoWindow.close();
        })

    })
}

const showDataInTable = (data) => {
    var html = '';
    data.forEach((country) => {
        html += `
        <tr class="country-table-data">
            <td><img class="table-flag" src="${country.countryInfo.flag}" alt="Flag of ${country.country}">${country.country}</td>
            <td style="text-align: right" >${country.cases}</td>
            <td style="text-align: right">${country.recovered}</td>
            <td style="text-align: right">${country.deaths}</td>
        </tr>
        `
    })
    document.getElementById("table-data").innerHTML = html;
}

