"""
QuickCart Enterprise Data Quality & Validation Engine.
Provides schema assertion, statistical distribution checking, anomaly detection,
and automated constraint enforcement across raw CDC streams and analytical marts.
"""

from typing import Dict, List, Any, Optional
import math

class DataQualityResult:
    def __init__(self, check_name: str, passed: bool, message: str, details: Optional[Dict[str, Any]] = None):
        self.check_name = check_name
        self.passed = passed
        self.message = message
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "check_name": self.check_name,
            "passed": self.passed,
            "message": self.message,
            "details": self.details
        }


class DataValidator:
    """Enterprise Data Quality Rule Evaluator."""

    @staticmethod
    def validate_not_null(records: List[Dict[str, Any]], field_name: str) -> DataQualityResult:
        null_count = sum(1 for r in records if r.get(field_name) is None)
        total = len(records)
        passed = (null_count == 0)
        return DataQualityResult(
            check_name=f"not_null_check_{field_name}",
            passed=passed,
            message=f"{field_name}: {null_count}/{total} null records detected" if not passed else f"{field_name} has zero nulls",
            details={"field": field_name, "total_records": total, "null_count": null_count}
        )

    @staticmethod
    def validate_unique(records: List[Dict[str, Any]], field_name: str) -> DataQualityResult:
        values = [r.get(field_name) for r in records if r.get(field_name) is not None]
        unique_values = set(values)
        duplicates = len(values) - len(unique_values)
        passed = (duplicates == 0)
        return DataQualityResult(
            check_name=f"uniqueness_check_{field_name}",
            passed=passed,
            message=f"{field_name}: {duplicates} duplicate values found" if not passed else f"{field_name} is completely unique",
            details={"field": field_name, "total_values": len(values), "unique_count": len(unique_values)}
        )

    @staticmethod
    def validate_numeric_range(
        records: List[Dict[str, Any]],
        field_name: str,
        min_val: Optional[float] = None,
        max_val: Optional[float] = None
    ) -> DataQualityResult:
        violations = []
        for r in records:
            val = r.get(field_name)
            if val is not None:
                try:
                    num = float(val)
                    if min_val is not None and num < min_val:
                        violations.append(num)
                    elif max_val is not None and num > max_val:
                        violations.append(num)
                except (ValueError, TypeError):
                    violations.append(val)

        passed = (len(violations) == 0)
        return DataQualityResult(
            check_name=f"numeric_range_check_{field_name}",
            passed=passed,
            message=f"{field_name}: {len(violations)} range violations found" if not passed else f"{field_name} within range [{min_val}, {max_val}]",
            details={"field": field_name, "min": min_val, "max": max_val, "violation_count": len(violations)}
        )

    @staticmethod
    def validate_accepted_values(
        records: List[Dict[str, Any]],
        field_name: str,
        accepted_set: set
    ) -> DataQualityResult:
        invalid_values = [r.get(field_name) for r in records if r.get(field_name) not in accepted_set]
        passed = (len(invalid_values) == 0)
        return DataQualityResult(
            check_name=f"accepted_values_check_{field_name}",
            passed=passed,
            message=f"{field_name}: {len(invalid_values)} unacceptable values detected" if not passed else f"{field_name} strictly matches accepted enum set",
            details={"field": field_name, "accepted_set": list(accepted_set), "invalid_count": len(invalid_values)}
        )

    @staticmethod
    def validate_foreign_key_integrity(
        child_records: List[Dict[str, Any]],
        child_fk_field: str,
        parent_records: List[Dict[str, Any]],
        parent_pk_field: str
    ) -> DataQualityResult:
        parent_pks = {p.get(parent_pk_field) for p in parent_records if p.get(parent_pk_field) is not None}
        orphans = [c for c in child_records if c.get(child_fk_field) not in parent_pks]
        passed = (len(orphans) == 0)
        return DataQualityResult(
            check_name=f"referential_integrity_{child_fk_field}_to_{parent_pk_field}",
            passed=passed,
            message=f"Orphan records: {len(orphans)} child rows refer to missing parent PKs" if not passed else "Referential integrity 100% intact",
            details={"orphan_count": len(orphans)}
        )
