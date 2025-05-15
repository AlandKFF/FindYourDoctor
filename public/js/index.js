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
  const countrySelect = document.querySelector('select[name="country"]');
  const citySelect = document.querySelector('select[name="city"]');
  const areaSelect = document.querySelector('select[name="area"]');

  if (countrySelect && citySelect && areaSelect) {
    countrySelect.addEventListener('change', function() {
      const countryId = this.value;
      citySelect.innerHTML = '<option value="">All Cities</option>';
      areaSelect.innerHTML = '<option value="">All Areas</option>';
      if (countryId) {
        fetch(`/hospitals/api/cities?country_id=${countryId}`)
          .then(res => res.json())
          .then(cities => {
            cities.forEach(city => {
              const opt = document.createElement('option');
              opt.value = city.city_id;
              opt.textContent = city.name;
              citySelect.appendChild(opt);
            });
          });
      }
    });

    citySelect.addEventListener('change', function() {
      const cityId = this.value;
      areaSelect.innerHTML = '<option value="">All Areas</option>';
      if (cityId) {
        fetch(`/hospitals/api/areas?city_id=${cityId}`)
          .then(res => res.json())
          .then(areas => {
            areas.forEach(area => {
              const opt = document.createElement('option');
              opt.value = area.area_id;
              opt.textContent = area.name;
              areaSelect.appendChild(opt);
            });
          });
      }
    });
  }
});

document.querySelectorAll('.get-direction').forEach(link => {
  link.addEventListener('click', function(event) {
    event.preventDefault();
    const destination = link.getAttribute('data-destination');
    
    // Open Google Maps directly showing only the destination location
    // This doesn't request the user's current location
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  });
});
// Removed the second event listener that was requesting location permissions
