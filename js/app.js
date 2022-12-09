function addressAutocomplete(containerElement, callback, options) {

    const MIN_ADDRESS_LENGTH = 2;
    const DEBOUNCE_DELAY = 300;
    
    // create container for input element
    const inputContainerElement = document.createElement("div");
    inputContainerElement.setAttribute("class", "input-container");
    containerElement.appendChild(inputContainerElement);
    
    // create input element
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.style.borderRadius='15px';
    inputElement.style.boxShadow='inset -2px -2px 5px rgba(0, 0, 0, .3)';
    inputElement.style.padding='15px'
    inputElement.setAttribute("placeholder", options.placeholder);
    inputContainerElement.appendChild(inputElement);
    
    // add input field clear button
    const clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      inputElement.value = '';
      callback(null);
      clearButton.classList.remove("visible");
      closeDropDownList();
    });
    inputContainerElement.appendChild(clearButton);
    
    /* We will call the API with a timeout to prevent unneccessary API activity.*/
    let currentTimeout;
    
    /* Save the current request promise reject function. To be able to cancel the promise when a new request comes */
    let currentPromiseReject;
    
    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    let focusedItemIndex;
    
    /* Process a user input: */
    inputElement.addEventListener("input", function(e) {
      const currentValue = this.value;
      /* Close any already open dropdown list */
      closeDropDownList();
      // Cancel previous timeout
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    
      // Cancel previous request promise
      if (currentPromiseReject) {
        currentPromiseReject({
          canceled: true
        });
      }
    
      if (!currentValue) {
        clearButton.classList.remove("visible");
      }
    
      // Show clearButton when there is a text
      clearButton.classList.add("visible");
    
      // Skip empty or short address strings
      if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
        return false;
      }
    
      /* Call the Address Autocomplete API with a delay */
      currentTimeout = setTimeout(() => {
        currentTimeout = null;
    
        /* Create a new promise and send geocoding request */
        const promise = new Promise((resolve, reject) => {
          currentPromiseReject = reject;
    
          // The API Key provided is restricted to JSFiddle website
          // Get your own API Key on https://myprojects.geoapify.com
          const apiKey = "40e3f91cd76e412a97da1697f2fca7b7";
    
          let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&format=json&limit=5&apiKey=${apiKey}`;

          fetch(url)
            .then(response => {
              currentPromiseReject = null;
              // check if the call was successful
              if (response.ok) {
                response.json().then(data => resolve(data));
              } else {
                response.json().then(data => reject(data));
              }
       
            });
        });
        promise.then((data) => {
          // here we get address suggestions
          currentItems = data.results;
    
          /*create a DIV element that will contain the items (values):*/
          const autocompleteItemsElement = document.createElement("div");
          autocompleteItemsElement.setAttribute("class", "autocomplete-items");
          inputContainerElement.appendChild(autocompleteItemsElement);
    
          /* For each item in the results */
          data.results.forEach((result, index) => {
            /* Create a DIV element for each element: */
            const itemElement = document.createElement("div");
            /* Set formatted address as item value */
            itemElement.innerHTML = result.formatted;
            autocompleteItemsElement.appendChild(itemElement);
    
            /* Set the value for the autocomplete text field and notify: */
            itemElement.addEventListener("click", function(e) {
              inputElement.value = currentItems[index].formatted;
              callback(currentItems[index]);
              /* Close the list of autocompleted values: */
              closeDropDownList();
             let latitude = currentItems[index].lat;
             let longitude = currentItems[index].lon;
             getWeather(latitude, longitude);
            });
          });
          
        }, (err) => {
          if (!err.canceled) {
            console.log(err);
          }
        });
      }, DEBOUNCE_DELAY);
    });
// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");

const tempElement = document.querySelector(".temperature-value h2");

const descElement = document.querySelector(".temperature-description h3");

const feelslike = document.querySelector(".feels-like");

const locationElement = document.querySelector(".location h1");

const presure = document.querySelector(".presure");

const humidity = document.querySelector(".humidity");
// App data
const weather = {};

weather.temperature = {
    unit : "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY
const key = "82005d27a116c2880c8f0fcb866998a0";

// CHECK IF BROWSER SUPPORTS GEOLOCATION

const btn = document.querySelector('button');
btn.addEventListener("click",()=>{
    if('geolocation' in navigator){
        navigator.geolocation.getCurrentPosition(setPosition, showError);
    }else{
        notificationElement.style.display = "block";
        notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
    }
 
});

// SET USER'S POSITION
function setPosition(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    
    getWeather(latitude, longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error){
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude){
    let api = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    
    fetch(api)
    .then(function(response){
        let data = response.json();
        return data;
    })
    .then(function(data){
        weather.temperature.value = Math.floor(data.main.temp - KELVIN);
        weather.description = data.weather[0].description.charAt(0).toUpperCase()+data.weather[0].description.slice(1);
        weather.feelslike = Math.floor(data.main.feels_like - KELVIN);
        weather.iconId = data.weather[0].icon;
        weather.city = data.name;
        weather.country = data.sys.country;
        weather.presure = Math.floor(data.wind.speed);
        weather.humidity = data.main.humidity;

    })
    .then(function(){
        displayWeather();
    });
}

// DISPLAY WEATHER TO UI
function displayWeather(){
    iconElement.innerHTML = `<img src="icon/icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°`;
    feelslike.innerHTML =   ` <span>Feels like ${weather.feelslike}<sup>o</sup></span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    presure.innerHTML =`<span>${weather.presure}km/h</span>`;
   humidity.innerHTML = `<span>${weather.humidity}%</span>`
}

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}

// WHEN THE USER CLICKS ON THE TEMPERATURE ELEMENET
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;
    
    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});


    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function(e) {
      let autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
      if (autocompleteItemsElement) {
        var itemElements = autocompleteItemsElement.getElementsByTagName("div");
        if (e.keyCode == 40) {
          e.preventDefault();
          /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
          focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
          /*and and make the current item more visible:*/
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode == 38) {
          e.preventDefault();
    
          /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
          focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
          /*and and make the current item more visible:*/
          setActive(itemElements, focusedItemIndex);
        } else if (e.keyCode == 13) {
          /* If the ENTER key is pressed and value as selected, close the list*/
          e.preventDefault();
          if (focusedItemIndex > -1) {
            closeDropDownList();
          }
        }
      } else {
        if (e.keyCode == 40) {
          /* Open dropdown list again */
          var event = document.createEvent('Event');
          event.initEvent('input', true, true);
          inputElement.dispatchEvent(event);
        }
      }
    });
    
    function setActive(items, index) {
      if (!items || !items.length) return false;
    
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("autocomplete-active");
      }
    
      /* Add class "autocomplete-active" to the active element*/
      items[index].classList.add("autocomplete-active");
    
      // Change input value and notify
      inputElement.value = currentItems[index].formatted;
      callback(currentItems[index]);
    }
    
    function closeDropDownList() {
      const autocompleteItemsElement = inputContainerElement.querySelector(".autocomplete-items");
      if (autocompleteItemsElement) {
        inputContainerElement.removeChild(autocompleteItemsElement);
      }
    
      focusedItemIndex = -1;
    }
    
    function addIcon(buttonElement) {
      const svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svgElement.setAttribute('viewBox', "0 0 24 24");
      svgElement.setAttribute('height', "24");
    
      const iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
      iconElement.setAttribute('fill', 'currentColor');
      svgElement.appendChild(iconElement);
      buttonElement.appendChild(svgElement);
    }
    
    /* Close the autocomplete dropdown when the document is clicked. 
      Skip, when a user clicks on the input field */
    document.addEventListener("click", function(e) {
      if (e.target !== inputElement) {
        closeDropDownList();
      } else if (!containerElement.querySelector(".autocomplete-items")) {
        // open dropdown list again
        let event = document.createEvent('Event');
        event.initEvent('input', true, true);
        inputElement.dispatchEvent(event);
      }
    });
    }
    
    addressAutocomplete(document.getElementById("autocomplete-container"), (data) => {
    console.log("Selected option: ");
    }, {
    placeholder: "Enter an address here"
    });
    
    
    