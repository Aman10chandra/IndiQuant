"""Market data router — price, history, fundamentals, news, indicators, watchlist."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_db
from models.db import Watchlist
from models.schemas import (
    QuoteResponse, HistoryResponse, FundamentalsResponse,
    NewsResponse, IndicatorResponse, WatchlistItem, AddWatchlistRequest
)
from services.data_service import (
    get_quote, get_price_history, get_fundamentals,
    get_news, compute_indicator, normalize_ticker
)
from services.cache_service import cached
import yfinance as yf

import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=10)

router = APIRouter(prefix="/api/market", tags=["market"])

USER_ID = "demo_user"

# Default watchlist tickers
DEFAULT_TICKERS = ["TCS", "RELIANCE", "INFY", "HDFCBANK", "WIPRO", "BAJFINANCE", "SBIN", "ITC"]


@router.get("/quote/{ticker}", response_model=QuoteResponse)
async def quote(ticker: str):
    try:
        data = get_quote(ticker)
        return QuoteResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quotes")
async def batch_quotes(tickers: str = "TCS,RELIANCE,INFY,HDFCBANK"):
    """Batch quotes for watchlist. Pass comma-separated tickers."""
    ticker_list = [t.strip() for t in tickers.split(",")]
    loop = asyncio.get_running_loop()
    def _fetch(t):
        try:
            return get_quote(t)
        except Exception as e:
            return {"ticker": t.upper(), "error": str(e), "price": 0, "change_pct": 0}

    results = await asyncio.gather(*[loop.run_in_executor(executor, _fetch, t) for t in ticker_list])
    return {"quotes": list(results)}


@router.get("/history/{ticker}", response_model=HistoryResponse)
async def history(ticker: str, period: str = "3mo"):
    try:
        data = get_price_history(ticker, period)
        from models.schemas import OHLCVPoint
        return HistoryResponse(
            ticker=ticker.upper(),
            period=period,
            data=[OHLCVPoint(**p) for p in data],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fundamentals/{ticker}", response_model=FundamentalsResponse)
async def fundamentals(ticker: str):
    try:
        data = get_fundamentals(ticker)
        return FundamentalsResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news/{ticker}", response_model=NewsResponse)
async def news(ticker: str, count: int = 5):
    try:
        data = get_news(ticker, count)
        from models.schemas import NewsItem
        return NewsResponse(
            ticker=ticker.upper(),
            articles=[NewsItem(**a) for a in data],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/indicators/{ticker}")
async def indicators(ticker: str, indicator: str = "ALL"):
    try:
        data = compute_indicator(ticker, indicator)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_ticker(q: str):
    """Search for NSE tickers."""
    try:
        t = normalize_ticker(q)
        info = yf.Ticker(t).fast_info
        if info.get("symbol") or info.get("last_price"):
            return {"results": [{"ticker": q.upper(), "name": f"{q.upper()} Ltd.", "exchange": "NSE"}]}
        return {"results": []}
    except Exception:
        return {"results": []}


# ─── Watchlist ────────────────────────────────────────────────────────────────

@router.get("/watchlist")
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Watchlist).where(Watchlist.user_id == USER_ID))
    items = result.scalars().all()

    # Seed with default tickers if watchlist is empty
    if not items:
        for t in DEFAULT_TICKERS:
            db.add(Watchlist(user_id=USER_ID, ticker=t))
        await db.commit()
        result = await db.execute(select(Watchlist).where(Watchlist.user_id == USER_ID))
        items = result.scalars().all()

    loop = asyncio.get_running_loop()

    def fetch_item_quote(item):
        try:
            q = get_quote(item.ticker)
            return {
                "id": item.id,
                "ticker": item.ticker,
                "added_at": item.added_at.isoformat() if item.added_at else "",
                **q,
            }
        except Exception:
            return {
                "id": item.id,
                "ticker": item.ticker,
                "added_at": item.added_at.isoformat() if item.added_at else "",
                "price": 0,
                "change_pct": 0,
                "error": "Data unavailable",
            }

    tasks = [loop.run_in_executor(executor, fetch_item_quote, item) for item in items]
    watchlist_with_quotes = await asyncio.gather(*tasks)

    return {"watchlist": list(watchlist_with_quotes)}


@router.post("/watchlist")
async def add_to_watchlist(req: AddWatchlistRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Watchlist).where(Watchlist.user_id == USER_ID, Watchlist.ticker == req.ticker.upper())
    )
    if existing.scalar_one_or_none():
        return {"message": f"{req.ticker} already in watchlist"}
    db.add(Watchlist(user_id=USER_ID, ticker=req.ticker.upper()))
    await db.commit()
    return {"message": f"Added {req.ticker.upper()} to watchlist"}


@router.delete("/watchlist/{ticker}")
async def remove_from_watchlist(ticker: str, db: AsyncSession = Depends(get_db)):
    await db.execute(
        delete(Watchlist).where(Watchlist.user_id == USER_ID, Watchlist.ticker == ticker.upper())
    )
    await db.commit()
    return {"message": f"Removed {ticker.upper()} from watchlist"}


FALLBACK_INDICES = {
    "NIFTY50": {"value": 24366.00, "change": -29.80, "change_pct": -0.12},
    "SENSEX": {"value": 78009.25, "change": -70.75, "change_pct": -0.09},
    "NIFTY_BANK": {"value": 52635.25, "change": 240.10, "change_pct": 0.46},
    "NIFTY_IT": {"value": 38453.90, "change": 190.50, "change_pct": 0.50},
}


@router.get("/market-summary")
@cached("quote")
async def market_summary():
    """NIFTY 50 and SENSEX summary with ultra-fast RAM cache."""
    from services.data_service import get_ram_cached, set_ram_cached, get_quote
    
    cached_summary = get_ram_cached("market_summary", ttl_seconds=30)
    if cached_summary:
        return cached_summary

    indices = {"NIFTY50": "^NSEI", "SENSEX": "^BSESN", "NIFTY_BANK": "^NSEBANK", "NIFTY_IT": "^CNXIT"}
    loop = asyncio.get_running_loop()

    def fetch_index(pair):
        name, symbol = pair
        fb = FALLBACK_INDICES.get(name, {"value": 24000.0, "change": 0.0, "change_pct": 0.0})
        try:
            q = get_quote(symbol)
            curr = q.get("price", 0.0)
            prev = q.get("prev_close", 0.0)
            if not curr or not prev:
                curr = fb["value"]
                prev = curr - fb["change"]
            return name, {
                "value": round(curr, 2),
                "change": round(curr - prev, 2),
                "change_pct": round((curr - prev) / prev * 100, 2) if prev else 0,
            }
        except Exception:
            return name, fb

    tasks = [loop.run_in_executor(executor, fetch_index, item) for item in indices.items()]
    results = await asyncio.gather(*tasks)
    res_dict = dict(results)
    set_ram_cached("market_summary", res_dict)
    return res_dict


