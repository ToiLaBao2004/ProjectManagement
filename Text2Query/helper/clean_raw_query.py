import json
import datetime
import re

def clean_query(raw_query):   
    raw_query = raw_query.strip()
    if raw_query.startswith("```"):
        raw_query = raw_query.split("\n", 1)[-1]
    if raw_query.endswith("```"):
        raw_query = "\n".join(raw_query.split("\n")[:-1])
    
    raw_query = raw_query.replace("\\n", "").replace("\\t", "").replace("\\r", "")
    return raw_query.strip()


def convert_datetime_fields(obj):
    if isinstance(obj, dict):
        if "__datetime__" in obj and isinstance(obj["__datetime__"], str):
            try:
                return datetime.datetime.fromisoformat(
                    obj["__datetime__"].replace("Z", "+00:00")
                )
            except ValueError:
                return obj
        return {k: convert_datetime_fields(v) for k, v in obj.items()}

    elif isinstance(obj, list):
        return [convert_datetime_fields(item) for item in obj]

    else:
        return obj


def parse_and_convert_query(json_raw_query):
    converted = convert_datetime_fields(json_raw_query)
    return converted
