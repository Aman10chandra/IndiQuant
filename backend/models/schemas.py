from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ─── Market Data Schemas ──────────────────────────────────────────────────────

class QuoteResponse(BaseModel):
    ticker: str
    name: str
    price: float
    prev_close: float
    change: float
    change_pct: float
    volume: int
    market_cap: Optional[float]
    day_high: float
    day_low: float
    week_52_high: Optional[float]
    week_52_low: Optional[float]
    currency: str = "INR"


class OHLCVPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class HistoryResponse(BaseModel):
    ticker: str
    period: str
    data: List[OHLCVPoint]


class FundamentalsResponse(BaseModel):
    ticker: str
    name: str
    sector: Optional[str]
    industry: Optional[str]
    pe_ratio: Optional[float]
    pb_ratio: Optional[float]
    eps: Optional[float]
    debt_to_equity: Optional[float]
    roe: Optional[float]
    revenue_growth: Optional[float]
    earnings_growth: Optional[float]
    dividend_yield: Optional[float]
    market_cap: Optional[float]
    beta: Optional[float]
    description: Optional[str]


class NewsItem(BaseModel):
    title: str
    source: str
    published_at: str
    url: str
    summary: Optional[str]


class NewsResponse(BaseModel):
    ticker: str
    articles: List[NewsItem]


class IndicatorResponse(BaseModel):
    ticker: str
    indicator: str
    value: Any
    period: str


# ─── AI Feature Schemas ───────────────────────────────────────────────────────

class FundamentalsSummaryRequest(BaseModel):
    ticker: str


class FundamentalsSummaryResponse(BaseModel):
    ticker: str
    summary: str
    disclaimer: str


class TechnicalReadRequest(BaseModel):
    ticker: str
    period: str = "3mo"


class TechnicalReadResponse(BaseModel):
    ticker: str
    rsi: Optional[float]
    sma_20: Optional[float]
    sma_50: Optional[float]
    macd: Optional[float]
    signal: Optional[float]
    narrative: str
    disclaimer: str


class DigestRequest(BaseModel):
    tickers: List[str]
    period: str = "1d"


class DigestItem(BaseModel):
    ticker: str
    change_pct: float
    summary: str


class DigestResponse(BaseModel):
    period: str
    items: List[DigestItem]
    generated_at: str


class ExplainMetricRequest(BaseModel):
    metric: str
    value: float
    sector: Optional[str] = "General"


class ExplainMetricResponse(BaseModel):
    metric: str
    value: float
    explanation: str


class WatchlistItem(BaseModel):
    id: str
    ticker: str
    added_at: str


class AddWatchlistRequest(BaseModel):
    ticker: str
