import requests
from bs4 import BeautifulSoup
import json
import re
import time
import random
import os

DATA_DIR = os.environ.get('DATA_DIR', './data')  # default to ./data
LISTINGS_PATH = os.path.join(DATA_DIR, 'listings.json')

def load_existing_listings():
    if os.path.exists(LISTINGS_PATH):
        try:
            with open(LISTINGS_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading existing listings: {e}")
            return []
    return []

def save_listings(listings):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(LISTINGS_PATH, 'w', encoding='utf-8') as f:
        json.dump(listings, f, indent=2)

def scrape_properties():
    base_url = "https://repossessedhousesforsale.com/properties/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    # Load existing listings to append new data
    listings = load_existing_listings()
    existing_links = {listing['link'] for listing in listings}  # Track existing links to avoid duplicates
    page = 1
    max_pages = 335  # Safety limit to prevent infinite loops; adjust if needed

    while page <= max_pages:
        url = f"{base_url}?page={page}"
        print(f"Scraping page {page}: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            break

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Select property cards
        property_cards = soup.select('div[itemtype="https://schema.org/House"]')
        
        if not property_cards:
            print(f"No more properties found on page {page}. Stopping.")
            break

        page_listings = []
        for card in property_cards:
            try:
                # Extract title
                title_elem = card.select_one('div[itemprop="name"] a.archive-properties-title-link')
                title = title_elem.text.strip() if title_elem else "N/A"
                
                # Extract price
                price_elem = card.select_one('div[itemprop="additionalProperty"] div[itemprop="value"]')
                price_text = price_elem.text.strip() if price_elem else "N/A"
                price = 0
                if price_text != "N/A":
                    price_match = re.search(r'[\d,]+', price_text.replace('£', ''))
                    if price_match:
                        price = int(price_match.group().replace(',', ''))
                
                # Extract location
                location_elem = card.select_one('span[itemprop="address"]')
                location = location_elem.text.strip() if location_elem else "N/A"
                
                # Extract link
                link_elem = card.select_one('a.archive-properties-title-link')
                link = link_elem['href'] if link_elem else "N/A"
                
                # Only add if link is not already in existing listings
                if link not in existing_links:
                    page_listings.append({
                        "title": title,
                        "price": price,
                        "location": location,
                        "link": link
                    })
                    existing_links.add(link)
            except Exception as e:
                print(f"Error processing card on page {page}: {e}")
                continue
        
        # Append new listings from this page and save
        if page_listings:
            listings.extend(page_listings)
            save_listings(listings)
            print(f"Saved {len(page_listings)} new properties from page {page} to listings.json")
        
        page += 1
        # Add random delay between 3 and 6 seconds
        delay = random.uniform(3, 6)
        print(f"Waiting {delay:.2f} seconds before next request...")
        time.sleep(delay)

    return listings

if __name__ == "__main__":
    listings = scrape_properties()
    print(f"Total: Scraped and saved {len(listings)} unique properties to listings.json")