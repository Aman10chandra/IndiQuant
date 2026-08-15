# IndiQuant — AI-Powered NSE/BSE Financial Intelligence Terminal

**IndiQuant** is a modern, high-performance financial intelligence terminal and analytics platform built exclusively for Indian equities (**NSE** and **BSE**). It combines real-time market data, interactive financial charting, sector breadth heatmaps, live market news feeds, and layered Google Gemini AI analytics.

---

## 🌟 Key Features

### 1. 📊 Market Dashboard
* **Live Indices & Mini-Charts**: Real-time tracking of **NIFTY 50** (`^NSEI`) and **BSE SENSEX** (`^BSESN`) with interactive HTML5 Canvas price charts and percentage shifts.
* **Movers & Watchlist Table**: Real-time tracker of Indian equities with LTP (Last Traded Price), daily percentage changes, bullish/consolidation status tags, and sector categorizations.
* **Live Market News Feed**: Instant headlines for Indian equities with dual-pill tags (`$TCS`, `$RELIANCE`, `$INFY`, `$HDFCBANK`), verified publisher attribution (*Reuters*, *Bloomberg*, *CNBC-TV18*, *Mint*), relative timestamps, and direct external article links.
* **Sector Heatmap**: At-a-glance market breadth grid featuring top Indian market indices (**NIFTY IT**, **AUTO**, **BANK NIFTY**) color-coded by real-time performance.

### 2. 🤖 AI Market Digest
* **Custom Watchlist Analysis**: Add and manage any Indian equity tickers to generate AI-driven daily (`24h`) and weekly (`7d`) technical and sentiment summaries.
* **Persistent Watchlists**: Watchlist configurations and generated analysis results are preserved across browser sessions and client-side page transitions.
* **Manual Analysis Controls**: Watchlists can be customized freely without automatic re-computation; analysis is triggered on demand via the dedicated **Analyze Watchlist** / **Re-analyze** actions.

### 3. 📈 Deep Equity Analytics
* **Interactive Charting**: Switch effortlessly between Line and Candlestick OHLCV charts across multiple timeframes (`1D`, `1W`, `1M`, `3M`, `1Y`, `5Y`).
* **Algorithmic Technical Indicators**: Real-time indicator computation for **RSI (14-day)**, **SMA (20-day & 50-day)**, **MACD (12, 26, 9)**, and **Volume MA (20-day)**.
* **Fundamental Metrics**: In-depth balance sheet and valuation ratios including P/E Ratio, P/B Ratio, EPS (TTM), Return on Equity (ROE), Debt-to-Equity, Dividend Yield, and Market Cap.
* **AI Fundamentals Summary**: One-click structured financial analysis summarizing balance sheet health, growth momentum, and sector valuation.
* **AI Technical Read**: Quantitative technical bias synthesis interpreting moving average crossovers, momentum bands, and MACD divergence.

### 4. 🗂️ Indian Equities Directory
* Full directory of major NSE & BSE blue chips categorized across key sectors:
  * **Technology**: TCS, Infosys, Wipro, HCLTech
  * **Banking & Finance**: HDFC Bank, ICICI Bank, State Bank of India, Bajaj Finance, Kotak Mahindra Bank, Axis Bank
  * **Energy & Conglomerates**: Reliance Industries, ONGC, Power Grid, NTPC, Coal India
  * **Automotive**: Tata Motors, Mahindra & Mahindra, Maruti Suzuki
  * **FMCG & Retail**: ITC, Hindustan Unilever, Titan
  * **Infrastructure & Telecom**: Larsen & Toubro, Bharti Airtel

### 5. 🌗 Curated Dark & Light Mode
* High-contrast dark terminal theme (`#0A0E0C` base, `#8EB69B` sage accents, `#FF6B6B` semantic red) and forest emerald light theme (`#EEF7F1` base, `#051F20` text).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Frontend (React 18 + Vite SPA)                    │
│   Dashboard  │  AI Market Digest  │  Stock Analytics  │  Directory     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (Axios / Fetch)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Backend API (FastAPI)                            │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │ Data & Cache Service │  │ Normal AI Service  │  │ Market Router  │  │
│  │ - yfinance (NSE/BSE) │  │ - Gemini Flash LLM │  │ - Quotes       │  │
│  │ - NewsAPI Client     │  │ - Synthesis Engine │  │ - History      │  │
│  │ - In-Memory TTL      │  │ - Digest Pipeline  │  │ - Fundamentals │  │
│  └──────────────────────┘  └────────────────────┘  └────────────────┘  │
│                                       │                                │
│                            ┌──────────▼──────────┐                     │
│                            │ SQLite Database     │                     │
│                            │ (Async SQLAlchemy)  │                     │
│                            └─────────────────────┘                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Frontend**:
  * **Framework**: React 18, Vite
  * **Routing**: React Router v6
  * **Styling**: Vanilla CSS Design Tokens (Zero Tailwind dependency for maximum UI control)
  * **Charting**: Custom HTML5 Canvas OHLCV engine
* **Backend**:
  * **Framework**: FastAPI (Python 3.10+)
  * **Data Engine**: `yfinance`, `pandas`, `requests`
  * **AI / LLM**: Google Generative AI SDK (`gemini-flash-latest`, `gemini-pro-latest`)
  * **Database**: SQLite with `aiosqlite` & Async SQLAlchemy
  * **Caching**: In-memory TTL decorator caching (`cachetools`)

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10+)
* **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Setup
```bash
cd backend

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables (.env)
cp .env.example .env
# Open .env and set your GEMINI_API_KEY:
# GEMINI_API_KEY=your_gemini_api_key_here

# 4. Start the FastAPI server
uvicorn main:app --reload --port 8000
```
The backend API will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

---

### 3. Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 📡 Core API Reference

### Market Data Endpoints (`/api/market`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/market/quote/{ticker}` | Real-time quote and pricing for NSE/BSE equity |
| `GET` | `/api/market/quotes?tickers=...` | Batch quotes for multiple equities |
| `GET` | `/api/market/history/{ticker}?period=3mo` | Historical OHLCV candlestick data |
| `GET` | `/api/market/fundamentals/{ticker}` | Valuation ratios, balance sheet metrics, and market cap |
| `GET` | `/api/market/indicators/{ticker}?indicator=ALL` | Computed technical indicators (RSI, SMA20, SMA50, MACD) |
| `GET` | `/api/market/news/{ticker}` | Latest market headlines for a specific stock |
| `GET` | `/api/market/market-summary` | Summary and percentage shifts for NIFTY 50 and SENSEX |
| `GET` | `/api/market/watchlist` | Retrieve saved user watchlist |

### AI Analysis Endpoints (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/fundamentals-summary` | 3–4 sentence financial health summary powered by Gemini |
| `POST` | `/api/ai/technical-read` | Quantitative technical bias synthesis from moving averages & indicators |
| `POST` | `/api/ai/digest` | Multi-ticker technical and sentiment market digest |
| `POST` | `/api/ai/explain-metric` | Plain-English educational explanation for any financial metric |

---

## 🛡️ Disclaimer
*IndiQuant is built for educational and research purposes only. The platform does not provide registered financial advice or stock recommendations. Always conduct independent research and consult a certified financial advisor before making investment decisions.*
