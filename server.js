const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const crypto = require('crypto'); // To generate unique IDs
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const { COMPANY_ID, POLICY_ID, API_KEY, REGION, API_SECRET } = process.env;
const apiRoot = REGION ? `https://auth.pingone.${REGION}/` : null;

app.use(express.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// Middleware to protect routes with API_SECRET
function authenticate(req, res, next) {
  const apiSecret = req.headers['api_secret'];
  if (apiSecret && apiSecret === API_SECRET) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid API secret' });
  }
}

// Helper function to generate a unique link ID
function generateLinkId() {
  return crypto.randomBytes(8).toString('hex');
}

// Path to consolidated data file
const dataFilePath = path.join(__dirname, 'public', 'json', 'all_products.json');

// Load all products data
function loadProductData() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading product data:', error);
    return null;
  }
}

// Save updated product data
function saveProductData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Product data saved successfully.');
    return true;
  } catch (error) {
    console.error('Error saving product data:', error);
    return false;
  }
}

// Get all links for all products
app.get('/api/all-links', authenticate, (req, res) => {
  const data = loadProductData();
  
  if (!data) {
    return res.status(500).json({ error: 'Failed to load product data.' });
  }

  res.status(200).json(data);
});

// Get Davinci info
app.get('/api/davinci-config', async (req, res) => {
    if (COMPANY_ID && POLICY_ID && API_KEY && REGION) {
        try {
            const url = `https://orchestrate-api.pingone.${REGION}/v1/company/${COMPANY_ID}/sdktoken`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'X-SK-API-KEY': API_KEY },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch SDK token: ${response.status} - ${errorText}`);
                return res.status(response.status).json({ error: 'Failed to fetch SDK token', details: errorText });
            }

            const data = await response.json();
            res.json({
                access_token: data.access_token,
                apiRoot: apiRoot,
                companyId: COMPANY_ID,
                policyId: POLICY_ID,
            });
        } catch (error) {
            console.error('Error fetching SDK token:', error.message);
            res.status(500).json({ error: 'Server error retrieving SDK token', details: error.message });
        }
    } else {
        console.error('Missing environment variables:', { COMPANY_ID, POLICY_ID, API_KEY, REGION });
        res.status(400).json({ error: 'Incomplete configuration: Check environment variables.' });
    }
});

// Get all links for a specific product and level
app.get('/api/links', authenticate, (req, res) => {
  const productId = req.headers['product_id'];
  const level = req.headers['level'];

  if (!productId || !level) {
    return res.status(400).json({ error: 'Product ID and level are required in headers.' });
  }

  const data = loadProductData();
  if (!data || !data[productId] || !data[productId].levels[level]) {
    return res.status(404).json({ error: 'Product or level not found.' });
  }

  const links = data[productId].levels[level];
  res.status(200).json({ links });
});

// Create a new link
app.post('/api/links', authenticate, (req, res) => {
  const productId = req.headers['product_id'];
  const level = req.headers['level'];
  const text = req.headers['text'];
  const url = req.headers['url'];

  if (!productId || !level || !text || !url) {
    return res.status(400).json({ error: 'Product ID, level, text, and URL are required in headers.' });
  }

  const data = loadProductData();
  if (!data || !data[productId]) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const linkId = generateLinkId();
  const newLink = { linkId, text, url };

  if (!data[productId].levels[level]) {
    data[productId].levels[level] = [];
  }
  data[productId].levels[level].push(newLink);

  if (saveProductData(data)) {
    res.status(201).json({ message: 'Link created successfully', link: newLink });
  } else {
    res.status(500).json({ error: 'Failed to save new link.' });
  }
});

// Read a link by linkId
app.get('/api/links/:linkId', authenticate, (req, res) => {
  const { linkId } = req.params;
  const data = loadProductData();

  for (const productId in data) {
    for (const level in data[productId].levels) {
      const link = data[productId].levels[level].find(link => link.linkId === linkId);
      if (link) {
        return res.status(200).json({ productId, level, link });
      }
    }
  }

  res.status(404).json({ error: 'Link not found.' });
});

// Update a link by linkId
app.put('/api/links', authenticate, (req, res) => {
  const linkId = req.headers['link_id'];
  const text = req.headers['text'];
  const url = req.headers['url'];

  if (!linkId) {
    return res.status(400).json({ error: 'Link ID is required in headers.' });
  }

  const data = loadProductData();
  let linkFound = false;

  for (const productId in data) {
    for (const level in data[productId].levels) {
      const link = data[productId].levels[level].find(link => link.linkId === linkId);
      if (link) {
        if (text) link.text = text;
        if (url) link.url = url;
        linkFound = true;
        break;
      }
    }
    if (linkFound) break;
  }

  if (linkFound) {
    if (saveProductData(data)) {
      res.status(200).json({ message: 'Link updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save updated link.' });
    }
  } else {
    res.status(404).json({ error: 'Link not found.' });
  }
});


// Delete a link by linkId in the headers
app.delete('/api/links', authenticate, (req, res) => {
  const linkId = req.headers['link_id']; // Access linkId from headers

  if (!linkId) {
    return res.status(400).json({ error: 'Link ID is required in headers.' });
  }

  const data = loadProductData();
  let linkFound = false;

  for (const productId in data) {
    for (const level in data[productId].levels) {
      const linkIndex = data[productId].levels[level].findIndex(link => link.linkId === linkId);
      if (linkIndex !== -1) {
        data[productId].levels[level].splice(linkIndex, 1);
        linkFound = true;
        break;
      }
    }
    if (linkFound) break;
  }

  if (linkFound) {
    if (saveProductData(data)) {
      res.status(200).json({ message: 'Link deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save updated product data.' });
    }
  } else {
    res.status(404).json({ error: 'Link not found.' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (!COMPANY_ID || !POLICY_ID || !API_KEY || !REGION) {
    console.warn('DaVinci widget is not configured due to missing environment variables.');
  }
});

