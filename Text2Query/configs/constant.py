EXAMPLE_QUERY_JSON = """
{"collection": "Invoice", "aggregate": [
    {"$match": {"InvoiceDate": {"$gte": {"__datetime__": "2025-10-08T00:00:00Z"}}}},
    {"$group": {"_id": "$BillingCountry", "totalSpent": {"$sum": "$Total"}}},
    {"$sort": {"totalSpent": -1}},
    {"$limit": 5}
]}
"""
DATE_FORMAT={"__datetime__": "2025-10-08T00:00:00Z"}