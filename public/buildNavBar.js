let content = {}; // Declare content globally to store all product data


// Fetch all_products.json file and dynamically load content for each product
fetch("json/all_products.json")
  .then((response) => response.json())
  .then((data) => {
    content = data; // Store the JSON data in the global content variable
    buildNavigationBar(data); // Build the navbar after loading the content
  })
  .catch((error) => {
    console.error("Error loading all_products.json:", error);
  });

function createOtherProductNav() {
  //Creates other catagory in navbar that looks like "multi-tenant, singli-tenant, etc" but is clickable, clicking does the drop down just like "learner foundation etc" except just list products in other catagory clicking one shows calls showOtherProduct()""
}
function showOtherProduct() {
  //Shows product page with a back button that takes them back to beginnig (just the home), the product page just list links like in other product pages these product
}

// Function to build the navigation bar and handle level selection
// Inside buildNavbar.js
function buildNavigationBar(products) {
    const navbar = document.getElementById("navbar");

    navbar.innerHTML = ""; // Clear any existing content

    // Add the Left Logo
    const leftLogo = document.createElement("img");
    leftLogo.src = "https://cdn.glitch.global/e798cad3-0f2c-406e-8fac-b1be6e5e7cd1/PIC-Horizontal-Logo-White.png?v=1729713397219";
    leftLogo.alt = "Left Logo";
    leftLogo.classList.add("logo", "left");
    navbar.appendChild(leftLogo);

    // Add the "Wizard - Start Here" link
    const startLink = document.createElement("a");
    startLink.classList.add("start");
    startLink.href = "/";
    startLink.textContent = "Wizard - Start Here";
    navbar.appendChild(startLink);

    // Group products by category
    const categories = {};
    Object.keys(products).forEach((productId) => {
        const product = products[productId];
        const category = product.productCategory;

        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push({ id: productId, data: product });
    });

    // Iterate over each category and add title and products
    Object.keys(categories).forEach((category) => {
        const categoryTitle = document.createElement("h3");
        categoryTitle.textContent = category;
        navbar.appendChild(categoryTitle);

        const categoryList = document.createElement("ul");
        categoryList.classList.add("category-list");

        // Add each product in the current category
        categories[category].forEach(({ id: productId, data: product }) => {
            const productItem = document.createElement("li");
            const productLink = document.createElement("a");
            productLink.href = `#${productId}`;
            productLink.innerHTML = `
                <img src="${product.iconNAV}" alt="${product.productName} Icon" class="icon" /> ${product.productName}
            `;

            const dropdown = document.createElement("ul");
            dropdown.classList.add("dropdown");
            dropdown.style.display = "none";

            // Add dropdown functionality for levels
            productLink.addEventListener("click", (event) => {
                event.preventDefault();
                dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";

                if (dropdown.childElementCount === 0) {
                    const levels = product.levels;
                    if (levels) {
                        Object.keys(levels).forEach((level) => {
                            const levelItem = document.createElement("li");
                            const levelLink = document.createElement("a");

                            levelLink.href = `#${productId}_${level.toLowerCase().replace(" ", "_")}`;
                            levelLink.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                            levelLink.addEventListener("click", (event) => {
                                event.preventDefault();
                                displayLevelContent(productId, level);
                            });

                            levelItem.appendChild(levelLink);
                            dropdown.appendChild(levelItem);
                        });
                    } else {
                        const noLevelsItem = document.createElement("li");
                        noLevelsItem.textContent = "No levels available";
                        dropdown.appendChild(noLevelsItem);
                    }
                }
            });

            productItem.appendChild(productLink);
            productItem.appendChild(dropdown);
            categoryList.appendChild(productItem);

            productItem.addEventListener("mouseleave", () => {
                dropdown.style.display = "none";
            });
        });

        navbar.appendChild(categoryList);
    });
}

// Function to display the content for the selected level
function displayLevelContent(productId, levelName) {
    document.getElementById('links').style.display = 'none';

  const contentHeader = document.getElementById("content-header");
  const questionText = document.getElementById("question-text");
      const productButtonsContainer = document.getElementById("product-buttons");
  productButtonsContainer.style.display = "none";

  // Set the title and question text
  contentHeader.style.display = "none";
  questionText.style.display = "none";
  document.getElementById("levels").style.display = "none"; // Hide slider

    const product = content[productId]; // Use the global content object to get the product data
    if (!product || !product.levels) return;

    const levelContent = product.levels[levelName.toLowerCase()];
    if (levelContent && levelContent.length > 0) {
        const html = levelContent
            .map((item) => `<a href="${item.url}" class="link" target="_blank">${item.text}</a>`)
            .join("<br>");

        document.getElementById("content").innerHTML = `
            <br><h2>${product.productName} - ${levelName.charAt(0).toUpperCase() + levelName.slice(1)}</h2><br>
            <p>${html}</p>
        `;
    } else {
        document.getElementById("content").innerHTML = "<h2>No content available for this level</h2>";
    }
}
