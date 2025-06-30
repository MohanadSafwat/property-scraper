# Property Listings Scraper and API

This project provides a Python web scraper for extracting property listings from `repossessedhousesforsale.com` and a Node.js Express API to serve the scraped data with filtering and pagination capabilities. You can run the project using **Docker** or **Local** setup.

## Project Structure

```
property-scraper/
├── scraper/
│   ├── data/
│   │   └── listings.json
│   ├── Dockerfile
│   ├── scraper.py
│   └── requirements.txt
├── api/
│   ├── data/
│   │   └── listings.json (symlinked or copied from scraper/)
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── swagger.yaml
├── docker-compose.yaml
├── .gitignore
└── README.md
```

🚀 **Live Demo Available**

You can explore the deployed demo version of this project without setting anything up locally:

- ✅ **API Endpoint:** [`https://absorbing-global-jump.glitch.me/api/listings`](https://absorbing-global-jump.glitch.me/api/listings)
- 📘 **Swagger UI:** [`https://absorbing-global-jump.glitch.me/api-docs`](https://absorbing-global-jump.glitch.me/api-docs)
- 📄 **Swagger JSON:** [`https://absorbing-global-jump.glitch.me/swagger.json`](https://absorbing-global-jump.glitch.me/swagger.json)

> Feel free to test the API and explore the documentation above. If you want to run it locally or with Docker, see the instructions below. 🚧

---

## Setup and Usage Options

You can run this project in two ways: **Docker** or **Local**. Choose one based on your environment and preferences.

### Option 1: Docker

#### Prerequisites
- Docker
- Docker Compose

#### Setup
1. Ensure Docker and Docker Compose are installed on your system.
2. No additional dependencies are required, as Docker handles the Python and Node.js environments.

#### Usage
1. From the root project directory (`property-scraper/`), build and run both services:
   ```bash
   docker-compose up --build
   ```
   - This builds and runs the `scraper` and `api` services.
   - The scraper runs once, saving `listings.json` to a shared Docker volume.
   - The API runs continuously on port 3000.

2. To run only the scraper:
   ```bash
   docker-compose run scraper
   ```

3. To run only the API (after the scraper has generated `listings.json`):
   ```bash
   docker-compose up api
   ```

4. Access the API at `http://localhost:3000` and Swagger UI at `http://localhost:3000/api-docs`.

5. To stop the services:
   ```bash
   docker-compose down
   ```

6. The `listings.json` file is saved in the shared volume, accessible in the `scraper/` or `api/` directories.

### Option 2: Local

#### Prerequisites
- Python 3.8+
- Node.js 16+
- npm (comes with Node.js)

#### Setup

**Scraper Setup**
1. Navigate to the `scraper` directory:
   ```bash
   cd scraper
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

**API Setup**
1. Navigate to the `api` directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `listings.json` is present in the `api` directory (copy or symlink from `scraper/listings.json`).

#### Usage

**Running the Scraper**
1. From the `scraper` directory, run:
   ```bash
   python scraper.py
   ```

2. This scrapes property listings from `https://repossessedhousesforsale.com/properties/` across all pages, with a random delay of 3-6 seconds between requests. Data is saved to `listings.json` after each page, and duplicates are avoided using unique links.

**Running the API**
1. From the `api` directory, start the server:
   ```bash
   npm start
   ```

2. The API will be available at `http://localhost:3000`, with Swagger UI at `http://localhost:3000/api-docs`.

## API Endpoints

- **GET /api/listings**
  - Returns property listings with optional filtering and pagination.
  - Query parameters:
    - `minPrice`: Minimum price (e.g., `minPrice=100000`)
    - `maxPrice`: Maximum price (e.g., `maxPrice=500000`)
    - `location`: Location filter (case-insensitive substring match, e.g., `location=NR7`)
    - `page`: Page number for pagination (default: 1, e.g., `page=2`)
    - `limit`: Number of listings per page (default: 10, e.g., `limit=20`)

  Example requests:
  ```bash
  curl http://localhost:3000/api/listings
  curl http://localhost:3000/api/listings?minPrice=100000&maxPrice=300000
  curl http://localhost:3000/api/listings?location=NR7&page=2&limit=5
  ```

  Response format:
  ```json
  {
    "listings": [
      {
        "title": "4 bedroom detached house for sale",
        "price": 420000,
        "location": "NR7",
        "link": "https://repossessedhousesforsale.com/properties/4-bedroom-detached-house-for-sale-98/"
      },
      ...
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
  ```

## Using Swagger and Postman

- **Swagger UI**: Access interactive API documentation at `http://localhost:3000/api-docs` after starting the server.
- **Exporting for Postman**:
  1. Open the Swagger UI at `http://localhost:3000/api-docs`.
  2. Download `swagger.json` from the `api` directory or view it in Swagger UI. Using `http://localhost:3000/swagger.json`
  3. Import `swagger.json` into Postman:
     - In Postman, click "Import" > "File" > select `swagger.json`.
     - Use the imported collection to test the API endpoints.

## Scraper Details

- Uses `requests` and `BeautifulSoup` to scrape the listings page.
- Handles pagination by iterating through pages (`?page=1`, `?page=2`, etc.) until no more properties are found.
- Saves data to `listings.json` after scraping each page to ensure persistence.
- Checks for duplicate listings by tracking unique links to avoid redundancy.
- Includes a random delay of 3-6 seconds between requests to respect the server.
- Extracts title, price, location, and link for each property.
- Saves data to `listings.json` in the following format:
  ```json
  [
    {
      "title": "Property Title",
      "price": 250000,
      "location": "City, Region",
      "link": "https://repossessedhousesforsale.com/properties/123"
    },
    ...
  ]
  ```

## API Details

- Built with Express.js.
- Reads from `listings.json` and exposes a single endpoint with filtering and pagination.
- Supports price range, location filtering, and pagination via query parameters.
- Includes Swagger UI for interactive API documentation at `/api-docs`.
- The Swagger specification (`swagger.yaml`) can be exported as JSON for use in Postman.

## Notes

- The scraper stops after no properties are found or after 335 pages (adjustable in `scraper.py`).
- Data is saved after each page, ensuring persistence if the scraper is interrupted.
- Duplicate listings are avoided by checking unique links.
- Random delays (3-6 seconds) prevent server overload.
- If the website's structure changes, update the CSS selectors in `scraper.py`.
- Error handling is implemented for both the scraper and API.
- The API runs on port 3000 by default. Modify `server.js` to change the port.
- For Docker, `listings.json` is shared via a Docker volume.
- Ensure `listings.json` is updated by running the scraper before starting the API for fresh data.

## .gitignore

```
node_modules/
scraper/venv/
scraper/__pycache__/
api/swagger.json
```
