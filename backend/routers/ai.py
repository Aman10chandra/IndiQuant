"""Normal AI endpoints — single-shot Gemini calls for all 4 fixed-pipeline features."""
from fastapi import APIRouter
from models.schemas import (
    FundamentalsSummaryRequest, FundamentalsSummaryResponse,
    TechnicalReadRequest, TechnicalReadResponse,
    DigestRequest, DigestResponse,
    ExplainMetricRequest, ExplainMetricResponse,
)
from services.normal_ai import (
    summarize_fundamentals, technical_read,
    generate_digest, explain_metric,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/fundamentals-summary", response_model=FundamentalsSummaryResponse)
async def fundamentals_summary(req: FundamentalsSummaryRequest):
    result = summarize_fundamentals(req.ticker)
    return FundamentalsSummaryResponse(**result)


@router.post("/technical-read", response_model=TechnicalReadResponse)
async def technical_read_endpoint(req: TechnicalReadRequest):
    result = technical_read(req.ticker, req.period)
    return TechnicalReadResponse(**result)


@router.post("/digest", response_model=DigestResponse)
async def digest_endpoint(req: DigestRequest):
    result = generate_digest(req.tickers, req.period)
    from models.schemas import DigestItem
    return DigestResponse(
        period=result["period"],
        items=[DigestItem(**i) for i in result["items"]],
        generated_at=result["generated_at"],
    )


@router.post("/explain-metric", response_model=ExplainMetricResponse)
async def explain_metric_endpoint(req: ExplainMetricRequest):
    result = explain_metric(req.metric, req.value, req.sector or "General")
    return ExplainMetricResponse(**result)
