"""
QuickCart Data Pipeline Orchestrator & Execution Manager.
Manages staged data transformations, validation checkpoints, and DAG state.
"""

from typing import Dict, List, Any, Callable, Optional
import time
try:
    from .data_validator import DataValidator, DataQualityResult
except ImportError:
    from data_validator import DataValidator, DataQualityResult


class PipelineTask:
    def __init__(self, task_id: str, action: Callable[[], Any], dependencies: Optional[List[str]] = None):
        self.task_id = task_id
        self.action = action
        self.dependencies = dependencies or []
        self.status = "PENDING"
        self.result = None
        self.error = None
        self.duration_seconds = 0.0


class PipelineOrchestrator:
    def __init__(self, pipeline_name: str = "quickcart_analytics_etl"):
        self.pipeline_name = pipeline_name
        self.tasks: Dict[str, PipelineTask] = {}
        self.execution_log: List[Dict[str, Any]] = []

    def add_task(self, task_id: str, action: Callable[[], Any], dependencies: Optional[List[str]] = None):
        self.tasks[task_id] = PipelineTask(task_id, action, dependencies)

    def run(self) -> bool:
        completed = set()
        all_passed = True

        for task_id, task in self.tasks.items():
            # Check dependencies
            missing = [dep for dep in task.dependencies if dep not in completed]
            if missing:
                task.status = "SKIPPED_DEPENDENCY_FAILED"
                all_passed = False
                continue

            start_t = time.time()
            try:
                task.result = task.action()
                task.status = "SUCCESS"
                completed.add(task_id)
            except Exception as e:
                task.status = "FAILED"
                task.error = str(e)
                all_passed = False
            finally:
                task.duration_seconds = time.time() - start_t
                self.execution_log.append({
                    "task_id": task_id,
                    "status": task.status,
                    "duration_seconds": round(task.duration_seconds, 4),
                    "error": task.error
                })

        return all_passed
