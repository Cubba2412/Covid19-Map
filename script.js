var map;


document.addEventListener("DOMContentLoaded", function () {
    //The first argument are the elements to which the plugin shall be initialized
    //The second argument has to be at least a empty object or a object with your desired options
    OverlayScrollbars(document.querySelectorAll('body'), {
        className: 'os-theme-dark',
        scrollbars: {
            clickScrolling: true,
        }
    });
});

window.onload = () => {
    getCountryData();
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 54,
            lng: 25
        },
        zoom: 4
    });
    infoWindow = new google.maps.InfoWindow({});
}

const getCountryData = () => {
    fetch("https://corona.lmao.ninja/v2/countries")
        .then((response) => {
            return response.json()
        }).then((data) => {
            showDataOnMap(data);
            showDataInTable(data);
        })
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
        <tr>
            <td>${country.country}</td>
            <td>${country.cases}</td>
            <td>${country.recovered}</td>
            <td>${country.deaths}</td>
        </tr>
        `
    })
    document.getElementById("table-data").innerHTML = html;
}