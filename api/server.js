const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

const app = express();
const port = 3000;

const DATA_PATH = path.join(__dirname, 'data', 'listings.json');
const FALLBACK_PATH = path.join(__dirname, '..', 'scraper', 'data', 'listings.json');

// Load Swagger document
const swaggerDocument = yaml.load('./swagger.yaml');

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

app.get('/api/listings', async (req, res) => {
    try {
        // Ensure the /data directory exists
        try {
            await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
        } catch (mkdirError) {
            console.warn('Could not create data directory:', mkdirError);
        }

        // Try to copy from fallback
        try {
            await fs.copyFile(FALLBACK_PATH, DATA_PATH);
            console.log('Copied listings.json from fallback.');
        } catch (copyError) {
            console.warn('No fallback listings.json to copy or copy failed:', copyError.message);
        }

        // Try to read from the DATA_PATH
        let data;
        try {
            data = await fs.readFile(DATA_PATH, 'utf8');
        } catch (readError) {
            return res.status(404).json({ error: 'No listings data available.' });
        }

        let listings = JSON.parse(data);

        // Apply filters
        const { minPrice, maxPrice, location, page = 1, limit = 10 } = req.query;

        if (minPrice) {
            listings = listings.filter(l => l.price >= parseInt(minPrice));
        }

        if (maxPrice) {
            listings = listings.filter(l => l.price <= parseInt(maxPrice));
        }

        if (location) {
            listings = listings.filter(l =>
                l.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Apply pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const totalItems = listings.length;
        const totalPages = Math.ceil(totalItems / limitNum);
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedListings = listings.slice(startIndex, startIndex + limitNum);

        res.json({
            listings: paginatedListings,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Error reading listings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the raw Swagger YAML as JSON at /swagger.json
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument); // already loaded as JSON via yaml.load
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
    console.log(`API endpoint available at http://localhost:${port}/api/listings`);
    console.log(`Swagger JSON available at http://localhost:${port}/swagger.json`);
});
