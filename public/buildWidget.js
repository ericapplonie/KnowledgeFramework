// Initialize the DaVinci widget
function initializeWidget() {
  fetch('/api/davinci-config')
    .then(response => response.json())
    .then(data => {
      if (data.access_token && data.apiRoot && data.companyId && data.policyId) {
        const props = {
          config: {
            method: 'runFlow',
            apiRoot: data.apiRoot,
            accessToken: data.access_token,
            companyId: data.companyId,
            policyId: data.policyId,
          },
          useModal: false,
          successCallback,
          errorCallback,
          onCloseModal,
        };

        // Show the widget overlay
        const overlay = document.getElementById('widget-overlay');
        overlay.style.visibility = 'visible'; // Make the overlay visible
        overlay.style.opacity = 1; // Make the overlay fade in
        document.body.classList.add('modal-open'); // Prevent body scrolling

        if (typeof davinci !== "undefined") {
          davinci.skRenderScreen(document.getElementById('widget'), props); // Initialize the widget
        } else {
          console.error("DaVinci SDK not loaded or undefined.");
        }

        // Close the widget when clicking the overlay
        overlay.addEventListener('click', (event) => {
          if (event.target === overlay) {
            onCloseModal(); // Only close the widget if clicked on the overlay
          }
        });
      } else {
        console.error("Incomplete configuration for DaVinci widget.");
        alert("Configuration for DaVinci widget is missing or incomplete.");
      }
    })
    .catch((error) => {
      console.error("Error fetching DaVinci widget configuration:", error);
      alert("Unable to load widget configuration.");
    });
}

// Success callback for DaVinci widget
function successCallback(response) {
  console.log("Widget success:", response);
  alert("Widget action completed successfully!");
}

// Error callback for DaVinci widget
function errorCallback(error) {
  console.error("Widget error:", error);
  alert("An error occurred while running the widget.");
}

// Close the widget modal (called when clicking outside of the widget)
function onCloseModal() {
  const overlay = document.getElementById('widget-overlay');
  overlay.style.visibility = 'hidden'; // Hide overlay
  document.body.classList.remove('modal-open'); // Re-enable body scrolling
  console.log("Widget closed.");
}

// Event listener for Admin link to open the widget
document.addEventListener("DOMContentLoaded", () => {
  const adminLink = document.getElementById('admin-link');

  if (adminLink) {
    adminLink.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default action like navigation to `/#`
      console.log("Admin link clicked, initializing widget...");
      initializeWidget(); // Call widget initialization
    });
  }
});
