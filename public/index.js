async function showLinks() {
    try {
        // Fetch the links from mainPageLinks.json
        const response = await fetch('json/mainPageLinks.json');
        if (!response.ok) {
            throw new Error('Failed to load links');
        }
        const data = await response.json();

        // Get the container element
        const linksContainer = document.getElementById('links');
        linksContainer.innerHTML = ''; // Clear any existing content

        // Iterate over the links and create buttons
        data.MainPageLinks.forEach(link => {
            const button = document.createElement('a');
            button.href = link.url;
            button.textContent = link.title;
            button.className = 'link-button';
            button.target = '_blank'; // Open link in a new tab
            linksContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

// Call the function to display links
document.addEventListener('DOMContentLoaded', showLinks);
