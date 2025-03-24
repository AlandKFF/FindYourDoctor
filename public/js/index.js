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