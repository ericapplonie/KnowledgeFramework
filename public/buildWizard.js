let content = {}; // Holds content for each product
let levelValue = 30; // Default value for the slider
let currentProductId = null; // Keeps track of the current selected product

// Fetch all_products.json and dynamically load content for each part
fetch("json/all_products.json")
  .then((response) => response.json())
  .then((data) => {
    content = data; // Store all products content
    createProductButtons(data); // Call function to create product buttons
  })
  .catch((error) => {
    console.error("Error loading all_products.json:", error);
  });

function createOtherProductButton() {
  
}
function showOtherProducts() {
  
}


// Function to create product buttons dynamically
function createProductButtons(products) {


  //ocument.getElementById('links').style.display = 'block';

  const productButtonsContainer = document.getElementById("product-buttons");
  const contentHeader = document.getElementById("content-header");
  const questionText = document.getElementById("question-text");

  // Set the title and question text
  contentHeader.innerText = "Ping Identity Partner Knowledge Framework";
  questionText.innerText = "What product are you wanting to learn about?";

  // Loop through each product in the products object
  Object.keys(products).forEach((productId) => {
    const product = products[productId];

    // Create a new button for each product
    const button = document.createElement("button");
    button.classList.add("button");
    button.id = `product-${productId}`;
    button.innerHTML = `
      <div class="wizard-icon-container">
        <img src="${product.iconButton}" alt="${product.productName} Icon" class="wizard icon" />
      </div>
      <br />
      ${product.productName}
    `;
    
    // Add an event listener for button clicks
    button.onclick = () => setProduct(productId);
    productButtonsContainer.appendChild(button);
  });
}

// Function to set the selected product and show the slider
function setProduct(productId) {
  document.getElementById('links').style.display = 'none';

  currentProductId = productId; // Set the current product ID
  const productName = content[productId].productName;
  const levelsSection = document.getElementById("levels");
  const productButtonsContainer = document.getElementById("product-buttons");
  const contentHeader = document.getElementById("content-header");
  const questionText = document.getElementById("question-text");

  // Update content header and question text
  contentHeader.innerText = `Select Level for ${productName}`;
  questionText.innerText = "";

  // Hide product buttons and show the level selection section
  productButtonsContainer.style.display = "none"; 
  levelsSection.style.display = "block"; 

  // Create the slider dynamically if it's not already present
  if (!document.getElementById("myRange")) {
    const sliderContainer = document.getElementById("levels");
    
    const sliderLabel = document.createElement("label");
    sliderLabel.setAttribute("for", "myRange");
    
    const slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("min", "1");
    slider.setAttribute("max", "60");
    slider.setAttribute("value", levelValue);
    slider.setAttribute("id", "myRange");
    slider.classList.add("slider");
    
    const sliderTicks = document.createElement("div");
    sliderTicks.classList.add("sliderticks");
    sliderTicks.innerHTML = `
      <span>Beginner</span>
      <span>Intermediate</span>
      <span>Expert</span>
    `;
    
    const goButton = document.createElement("button");
    goButton.setAttribute("id", "lvlButton");
    goButton.classList.add("goButton");
    goButton.innerText = "Go";
    goButton.onclick = () => setLevel();

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(sliderTicks);
    sliderContainer.appendChild(goButton);
    
    // Add Back Button to return to product selection
    const backButton = document.createElement("button");
    backButton.id = "backButton";
    backButton.classList.add("backButton");
    backButton.textContent = "Back";
    backButton.onclick = () => {
      document.getElementById("levels").style.display = "none"; // Hide slider
      document.getElementById("product-buttons").style.display = "block"; // Show product buttons again
      const contentHeader = document.getElementById("content-header");
      const questionText = document.getElementById("question-text");

  // Set the title and question text
  contentHeader.innerText = "Ping Identity Partner Knowledge Framework";
  questionText.innerText = "What product are you wanting to learn about?";
        location.reload();
    };
    sliderContainer.appendChild(backButton);
  }

  // Update the level value on slider change
  const slider = document.getElementById("myRange");
  slider.addEventListener("input", (event) => {
    levelValue = event.target.value;
  });
}

// Function to set the selected level and show the content
function setLevel() {
  document.getElementById('links').style.display = 'none';

  
  const levelKeys = [
    "foundation",
    "learner",
    "associate",
    "practitioner",
    "certified professional",
    "scholar",
    "certified expert",
    "documentation"
  ];

  // Map the slider value to the corresponding level
  const levelIndex = Math.floor(levelValue / 10); // Convert slider value to level index
  const levelKey = levelKeys[levelIndex];
  
  // Capitalize each word in the level name
  const formattedLevelKey = levelKey.split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const levelContent = content[currentProductId]?.levels?.[levelKey];
  const contentElement = document.getElementById("content");

  if (levelContent && levelContent.length > 0) {
    const linksHtml = levelContent
      .map((item) => `<a href="${item.url}" class="link" target="_blank">${item.text}</a>`)
      .join("<br>");
    
    contentElement.innerHTML = `
      <br><h2>${content[currentProductId].productName} - ${formattedLevelKey}</h2><br>
      <p>${linksHtml}</p>
    `;
  } else {
    contentElement.innerHTML = "<h2>No content available for this level</h2>";
  }

  // Hide the slider and go button after the level is selected
  document.getElementById("levels").style.display = "none"; // Hide the levels section
  const contentHeader = document.getElementById("content-header");
  contentHeader.style.display = "none"; // Hide content header when level is selected

  // Add a Back button to return to the level selection
  const backButton = document.createElement("button");
  backButton.id = "linksBackButton";
  backButton.classList.add("backButton");
  backButton.textContent = "Back";
  backButton.onclick = () => {
    document.getElementById("levels").style.display = "block"; // Show slider again
    contentElement.innerHTML = ""; // Clear level content
    contentHeader.style.display = "block"; // Show content header again
  };
  contentElement.appendChild(backButton);
}
