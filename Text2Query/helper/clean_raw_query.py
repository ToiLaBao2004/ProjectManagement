import json
import datetime
import re
from dateutil.relativedelta import relativedelta  
def clean_query(raw_query):   
    raw_query = raw_query.strip()
    if raw_query.startswith("```"):
        raw_query = raw_query.split("\n", 1)[-1]
    if raw_query.endswith("```"):
        raw_query = "\n".join(raw_query.split("\n")[:-1])
    
    raw_query = raw_query.replace("\\n", "").replace("\\t", "").replace("\\r", "")
    return raw_query.strip()

def parse_dynamic_datetime(val):

    now = datetime.datetime.now(datetime.timezone.utc)

    if val == "NOW":
        return now
    
    if val == "TODAY":
        return datetime.datetime.combine(now.date(), datetime.time(tzinfo=datetime.timezone.utc))
    
    if val == "NEXT_MONTH":
        return (now.replace(day=1) + relativedelta(months=+1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    if val == "LAST_MONTH":
        return (now.replace(day=1) + relativedelta(months=-1)).replace(hour=0, minute=0, second=0, microsecond=0)

    if m := re.match(r"(\d+)_DAYS_AGO", val):
        return now - datetime.timedelta(days=int(m.group(1)))
    
    if m := re.match(r"(\d+)_HOURS_AGO", val):
        return now - datetime.timedelta(hours=int(m.group(1)))
    
    if m := re.match(r"IN_(\d+)_DAYS", val):
        return now + datetime.timedelta(days=int(m.group(1)))
    
    if m := re.match(r"IN_(\d+)_HOURS", val):
        return now + datetime.timedelta(hours=int(m.group(1)))

    try:
        return datetime.datetime.fromisoformat(val.replace("Z", "+00:00"))
    except ValueError:
        return None


def convert_datetime_fields(obj):
    if isinstance(obj, dict):
        if "__datetime__" in obj and isinstance(obj["__datetime__"], str):
            parsed = parse_dynamic_datetime(obj["__datetime__"])
            return parsed if parsed else obj
        return {k: convert_datetime_fields(v) for k, v in obj.items()}

    if isinstance(obj, list):
        return [convert_datetime_fields(item) for item in obj]

    return obj

def parse_and_convert_query(json_raw_query):
    converted = convert_datetime_fields(json_raw_query)
    return converted



test_data = {
    "fixed_date": {"__datetime__": "2025-10-08T00:00:00Z"},
    "now": {"__datetime__": "NOW"},
    "today": {"__datetime__": "TODAY"},
    "days_ago_7": {"__datetime__": "7_DAYS_AGO"},
    "hours_ago_3": {"__datetime__": "3_HOURS_AGO"},
    "in_5_days": {"__datetime__": "IN_5_DAYS"},
    "in_12_hours": {"__datetime__": "IN_12_HOURS"},
    "next_month": {"__datetime__": "NEXT_MONTH"},
    "last_month": {"__datetime__": "LAST_MONTH"},

    # Test trong list
    "list_example": [
        {"eventStart": {"__datetime__": "NOW"}},
        {"eventEnd": {"__datetime__": "IN_3_DAYS"}},
        {"eventDeadline": {"__datetime__": "7_DAYS_AGO"}}
    ],

    # Test nested dict
    "nested": {
        "meta": {
            "createdAt": {"__datetime__": "LAST_MONTH"},
            "updatedAt": {"__datetime__": "NOW"}
        }
    },

    # Test giá trị sai
    "invalid": {"__datetime__": "NOT_A_DATE"}
}
