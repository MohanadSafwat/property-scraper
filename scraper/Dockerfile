FROM python:3.8-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV DATA_DIR=/app/data

CMD ["python", "scraper.py"]
