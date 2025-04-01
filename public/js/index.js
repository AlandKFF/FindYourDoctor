document.addEventListener('DOMContentLoaded', function() {
  const inputField = document.querySelector('form input[name="search"]');
  let timeoutId;

  // Check if the URL has a search parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) {
  inputField.focus();
  const valueLength = inputField.value.length;
  inputField.setSelectionRange(valueLength, valueLength);
  }

  inputField.addEventListener('input', function() {
	// Clear any existing timer
	clearTimeout(timeoutId);

	// Set a new timer to submit the form after 700ms of inactivity
	timeoutId = setTimeout(function() {
	  inputField.closest('form').submit();
	}, 700);
  });
});


document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.get-direction').forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const destination = link.getAttribute('data-destination');
            const google_map_api = "AIzaSyDz4rwd5VeTxJcr60OQ7Tm69VdzZr9L1-U"
            // Reverse geocoding using Google Maps Geocoding API
            // Replace YOUR_API_KEY with your actual Google Maps API key
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${google_map_api}`)
              .then(response => response.json())
              .then(data => {
                if (data.status === "OK" && data.results.length > 0) {
                  // Retrieve the full formatted address
                  const origin = data.results[0].formatted_address;
                  // Construct the Google Maps directions URL using the full address
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
                  window.open(url, '_blank');
                } else {
                  alert("Unable to retrieve your full address. Using coordinates instead.");
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(destination)}`;
                  window.open(url, '_blank');
                }
              })
              .catch(error => {
                alert("Error retrieving address. Using coordinates instead.");
                const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${encodeURIComponent(destination)}`;
                window.open(url, '_blank');
              });
          }, function(error) {
            alert("Error retrieving your location. Please check your settings.");
          });
        } else {
          alert("Geolocation is not supported by your browser.");
        }
      });
    });
  });
