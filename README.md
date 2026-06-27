# 🔥 NewsPulse

NewsPulse is an AI-powered news analytics dashboard that collects news articles, clusters similar stories, and visualizes trending topics in real time.

## Features

- Live News Dashboard
- Trending Clusters
- News Search
- Source Distribution Chart
- Top Trending Topics
- Refresh News
- Responsive UI

## Tech Stack

Frontend
- Next.js
- React
- Tailwind CSS
- Recharts

Backend
- Express.js
- SQLite

Scraper
- Python
- Feedparser
- Scikit-learn

Deployment
- Vercel
- Railway

## Setup

Clone the repository

git clone https://github.com/ayushimittal1412/NewsPulse

Install dependencies

Frontend
cd frontend
npm install
npm run dev

Backend
cd backend
npm install
npm start

Scraper
cd scraper
pip install -r requirements.txt
python scraper.py

## Architecture

Python Scraper
        ↓
SQLite Database
        ↓
Express.js REST API
        ↓
Next.js Frontend

## News Sources

- BBC RSS
- NPR RSS

## Topic Grouping

Articles are converted into TF-IDF vectors using Scikit-learn.
Cosine similarity is used to identify related articles, and similar stories are grouped into topic clusters.

## Limitations

- Uses only RSS feeds.
- Topic clustering is based on textual similarity and may occasionally group unrelated articles.
- Refresh depends on scraper execution.
- SQLite is suitable for small-scale projects but not for high traffic.

## Live Demo

Frontend:
https://news-pulse-4g0fsz92w-ayushis-projects-1ddd1ec0.vercel.app/

Backend:
https://newspulse-production-734a.up.railway.app/

## GitHub

https://github.com/ayushimittal1412/NewsPulse