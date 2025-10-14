EXAMPLE_QUERY_JSON = """
{"collection": "Invoice", "aggregate": [
    {"$match": {"InvoiceDate": {"$gte": {"__datetime__": "2025-10-08T00:00:00Z"}}}},
    {"$group": {"_id": "$BillingCountry", "totalSpent": {"$sum": "$Total"}}},
    {"$sort": {"totalSpent": -1}},
    {"$limit": 5}
]}
"""
DATE_FORMAT = """
When representing date values, use the following JSON format:
- Fixed date:
    { "__datetime__": "2025-10-08T00:00:00Z" }
- Current time (UTC now):
    { "__datetime__": "NOW" }
- Today at midnight (UTC):
    { "__datetime__": "TODAY" }
- X days ago (e.g., 7 days ago):
    { "__datetime__": "7_DAYS_AGO" }
- X hours ago (e.g., 3 hours ago):
    { "__datetime__": "3_HOURS_AGO" }
- Start of next month:
    { "__datetime__": "NEXT_MONTH" }
- Start of last month:
    { "__datetime__": "LAST_MONTH" }
"""
