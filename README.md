# Property Listings Scraper, API, and WordPress Plugin

This project provides a Python web scraper for extracting property listings from `repossessedhousesforsale.com`, a Node.js Express API to serve the scraped data with filtering, sorting, and pagination capabilities, and a WordPress plugin with a React-based dashboard to display the listings. The project can be run using **Docker** or **Local** setup.

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
├── wp-hidden-deals/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── dashboard.css
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── eslint.config.js
│   │   ├── vite.config.ts
│   │   └── README.md
│   └── wp-hidden-deals.php
├── docker-compose.yaml
├── .gitignore
└── README.md
```

🚀 **Live Demo Available**

You can explore the deployed demo version of the API without setting anything up locally:

- ✅ **API Endpoint:** [`https://property-scraper.glitch.me/api/listings`](https://property-scraper.glitch.me/api/listings)
- 📘 **Swagger UI:** [`https://property-scraper.glitch.me/api-docs`](https://property-scraper.glitch.me/api-docs)
- 📄 **Swagger JSON:** [`https://property-scraper.glitch.me/swagger.json`](https://property-scraper.glitch.me/swagger.json)

> Feel free to test the API and explore the documentation above. To run the WordPress plugin or API locally, see the instructions below. 🚧

---

## Setup and Usage Options

You can run this project in two ways: **Docker** or **Local**. The Docker setup includes WordPress, MySQL, the scraper, and the API, while the local setup allows running each component individually.


### Frontend Build (Required for Docker and Local Setup)

Before running the Docker or local setup, you must build the React frontend for the WordPress plugin:

1. Navigate to the `wp-hidden-deals/frontend` directory:
   ```bash
   cd wp-hidden-deals/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the React app:
   ```bash
   npm run build
   ```
   This generates the `build` directory with `main.js` and `index.css` files, which are used by the WordPress plugin.


### Option 1: Docker

#### Prerequisites
- Docker
- Docker Compose

#### Setup
1. Ensure Docker and Docker Compose are installed on your system.
2. Create a `.env` file in the project root with the following variables:
   ```
   APP_ENV=dev
   HIDDEN_DEALS_API_BASE=http://api:3000
   ```
   For production, set `HIDDEN_DEALS_API_BASE` to `https://property-scraper.glitch.me` and `APP_ENV` to `prod`.

3. The `wp-hidden-deals` directory should be mounted as a volume to the WordPress container (already configured in `docker-compose.yaml`).

#### Usage
1. From the root project directory (`property-scraper/`), build and run all services:
   ```bash
   docker-compose up --build
   ```
   - This builds and runs the `scraper`, `api`, `wordpress`, and `db` services.
   - The scraper runs once, saving `listings.json` to a shared Docker volume.
   - The API runs continuously on port `3000`.
   - WordPress runs on port `8080`, with the `wp-hidden-deals` plugin installed.
   - MySQL runs as the database for WordPress.

2. To run only the scraper:
   ```bash
   docker-compose run scraper
   ```

3. To run only the API (after the scraper has generated `listings.json`):
   ```bash
   docker-compose up api
   ```

4. Access the services:
   - **WordPress Admin**: `http://localhost:8080/wp-admin` (login and activate the "Hidden Deals" plugin).
   - **Hidden Deals Dashboard**: Navigate to the "Hidden Deals" menu in the WordPress admin panel.
   - **API**: `http://localhost:3000` and Swagger UI at `http://localhost:3000/api-docs`.

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
- PHP 7.4+ (for WordPress)
- MySQL 8.0+ (for WordPress)
- WordPress 6.6+ (for the plugin)

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

**WordPress Plugin Setup**
1. Set up a local WordPress installation:
   - Install WordPress 6.6+ locally (e.g., using XAMPP, MAMP, or a local server).
   - Configure MySQL with a database named `wordpress`, user `wordpress`, and password `wordpress`.

2. Copy the `wp-hidden-deals` directory to the WordPress plugins directory:
   ```bash
   cp -r wp-hidden-deals /path/to/wordpress/wp-content/plugins/
   ```

3. Navigate to the `wp-hidden-deals/frontend` directory:
   ```bash
   cd wp-hidden-deals/frontend
   ```

4. Install React dependencies:
   ```bash
   npm install
   ```

5. Build the React app:
   ```bash
   npm run build
   ```
   This generates the `build` directory with `main.js` and `index.css` files used by the plugin.

6. Activate the "Hidden Deals" plugin in the WordPress admin panel (`http://localhost/wordpress/wp-admin`).

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

**Running the WordPress Plugin**
1. Start your local WordPress server.
2. Log in to the WordPress admin panel (`http://localhost/wordpress/wp-admin`).
3. Navigate to the "Hidden Deals" menu to view the React-based dashboard, which fetches and displays property listings from the API.

## API Endpoints

- **GET /api/listings**
  - Returns property listings with optional filtering, sorting, and pagination.
  - Query parameters:
    - `minPrice`: Minimum price (e.g., `minPrice=100000`)
    - `maxPrice`: Maximum price (e.g., `maxPrice=500000`)
    - `location`: Location filter (case-insensitive substring match, e.g., `location=NR7`)
    - `page`: Page number for pagination (default: 1, e.g., `page=2`)
    - `limit`: Number of listings per page (default: 10, e.g., `limit=20`)
    - `sortBy`: Field to sort by (optional, e.g., `sortBy=price` or `sortBy=title`)
    - `sortOrder`: Sort order (optional, either `asc` or `desc`, default: `asc`)

  Example requests:
  ```bash
  curl http://localhost:3000/api/listings
  curl http://localhost:3000/api/listings?minPrice=100000&maxPrice=300000
  curl http://localhost:3000/api/listings?location=NR7&page=2&limit=5&sortBy=price&sortOrder=desc
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
  2. Download `swagger.json` from the `api` directory or view it at `http://localhost:3000/swagger.json`.
  3. Import `swagger.json` into Postman:
     - In Postman, click "Import" > "File" > select `swagger.json`.
     - Use the imported collection to test the API endpoints.

## WordPress Plugin Details

- **Plugin Name**: Hidden Deals
- **Description**: A WordPress plugin that displays a React-based dashboard for viewing property listings fetched from the API.
- **Features**:
  - Displays property listings in a user-friendly dashboard within the WordPress admin panel.
  - Supports filtering by price range and location (via API query parameters).
  - Requires the `manage_options` capability (admin access) to view the dashboard.
- **Frontend**: Built with React and TypeScript, using Vite for bundling. The React app is enqueued in WordPress and rendered in a `<div id="root">` element.
- **Backend Integration**: The plugin proxies API requests through WordPress (`/wp-json/hidden-deals/v1/listings`) or directly uses the API base URL (`http://localhost:3000` or `https://property-scraper.glitch.me`).

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
- Reads from `listings.json` and exposes a single endpoint with filtering, sorting, and pagination.
- Supports price range, location filtering, sorting (by price or title), and pagination via query parameters.
- Sorting is optional and can be applied using `sortBy` (e.g., `price` or `title`) and `sortOrder` (`asc` or `desc`).
- Includes Swagger UI for interactive API documentation at `/api-docs`.
- The Swagger specification (`swagger.yaml`) can be exported as JSON for use in Postman.

## Notes

- The scraper stops after no properties are found or after 335 pages (adjustable in `scraper.py`).
- Data is saved after each page, ensuring persistence if the scraper is interrupted.
- Duplicate listings are avoided by checking unique links.
- Random delays (3-6 seconds) prevent server overload.
- If the website's structure changes, update the CSS selectors in `scraper.py`.
- Error handling is implemented for the scraper, API, and WordPress plugin.
- The API runs on port 3000 by default. Modify `server.js` to change the port.
- For Docker, `listings.json` is shared via a Docker volume.
- Ensure `listings.json` is updated by running the scraper before starting the API for fresh data.
- The WordPress plugin requires the API to be running for the dashboard to fetch data.
- In production, set the `HIDDEN_DEALS_API_BASE` environment variable to `https://property-scraper.glitch.me`.

## .gitignore

```
node_modules/
scraper/venv/
scraper/__pycache__/
api/swagger.json
wp-hidden-deals/frontend/build/
wp-hidden-deals/frontend/node_modules/
```
