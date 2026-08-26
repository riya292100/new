"""
Product Co-Occurrence & Cross-Sell Recommendation Graph
"""
from typing import List, Dict, Any


def rank_frequently_bought_together(
    target_product_id: int,
    order_baskets: List[List[int]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Analyzes historical multi-item baskets to compute Jaccard co-occurrence affinity scores.
    """
    co_occurrences: Dict[int, int] = {}
    target_basket_count = 0

    for basket in order_baskets:
        if target_product_id in basket:
            target_basket_count += 1
            for item in basket:
                if item != target_product_id:
                    co_occurrences[item] = co_occurrences.get(item, 0) + 1

    if target_basket_count == 0 or not co_occurrences:
        return []

    ranked = []
    for item_id, count in co_occurrences.items():
        # Confidence = count / target_basket_count
        confidence = round(count / target_basket_count, 3)
        ranked.append({
            "product_id": item_id,
            "co_occurrence_count": count,
            "confidence_score": confidence
        })

    # Sort descending by confidence then count
    ranked.sort(key=lambda x: (x["confidence_score"], x["co_occurrence_count"]), reverse=True)
    return ranked[:top_k]
