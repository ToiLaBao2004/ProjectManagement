EXAMPLE_QUERY_JSON = """
{
    "collection":"Invoice",
    "aggregate":[
        {"$group":{"_id":"$BillingCountry","totalSpent":{"$sum":"$Total"}}},
        {"$sort": {"totalSpent":-1}},
        {"$limit":5}
    ]
}
"""
