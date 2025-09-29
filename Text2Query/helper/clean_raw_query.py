def clean_query(raw_query):   
    
    raw_query = raw_query.strip()
    if raw_query.startswith("```"):
        raw_query = raw_query.split("\n", 1)[-1]
    if raw_query.endswith("```"):
        raw_query = "\n".join(raw_query.split("\n")[:-1])
    
    raw_query = raw_query.replace("\\n", "").replace("\\t", "").replace("\\r", "")
    return raw_query.strip()
