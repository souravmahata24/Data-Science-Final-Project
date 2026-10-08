"""
Column mapping and fuzzy detection logic for user uploads.
Prevents dangerous silent mappings while automating sensible aliases.
"""

from typing import Dict, List, Optional
import difflib
from .config import COLUMN_SYNONYMS, REQUIRED_COLUMNS, RECOMMENDED_COLUMNS, OPTIONAL_COLUMNS

def suggest_mapping(df_columns: List[str]) -> Dict[str, Optional[str]]:
    """
    Given a list of dataset column names, returns a mapping {canonical_name: matched_column_or_None}.
    Employs exact matching first, then alias lookup, then difflib similarity >= 0.75.
    """
    cleaned_df_cols = {col: col.strip().lower().replace(" ", "_").replace("-", "_") for col in df_columns}
    mapping: Dict[str, Optional[str]] = {}
    used_cols = set()

    all_targets = REQUIRED_COLUMNS + RECOMMENDED_COLUMNS + OPTIONAL_COLUMNS

    for canonical in all_targets:
        synonyms = COLUMN_SYNONYMS.get(canonical, [canonical])
        matched = None

        # 1. Exact match on canonical or synonyms
        for orig, clean in cleaned_df_cols.items():
            if orig in used_cols:
                continue
            if clean in synonyms:
                matched = orig
                break

        # 2. Fuzzy match if no direct synonym hit
        if not matched:
            for orig, clean in cleaned_df_cols.items():
                if orig in used_cols:
                    continue
                for syn in synonyms:
                    ratio = difflib.SequenceMatcher(None, clean, syn).ratio()
                    if ratio >= 0.78:
                        matched = orig
                        break
                if matched:
                    break

        if matched:
            mapping[canonical] = matched
            used_cols.add(matched)
        else:
            mapping[canonical] = None

    return mapping
