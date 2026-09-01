"""
QuickCart Data Engineering Pipeline Package.
Provides declarative ETL runners, idempotent upserts, and analytics marts sync.
"""
from .run import DataPipelineRunner, run_pipeline

__all__ = ["DataPipelineRunner", "run_pipeline"]
