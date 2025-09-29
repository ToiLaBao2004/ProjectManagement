import json
def init_session(session_id):
    session = {
        "session_id": session_id,
        "history_chat": []
    }
    return session

def add_chat(redis, session_id, user, bot):
    key = f"session:{session_id}"
    raw = redis.get(key)
    if raw:
        session = json.loads(raw)
    else:
        session = init_session(session_id)
        
    session["history_chat"].append({"user": user, "bot": bot})

    redis.setex(key, 600, json.dumps(session))
    return raw

def get_chat(redis, session_id):
    key=f"session:{session_id}"
    return redis.get(key)

def clear_chat(redis,session_id):
    key=f"session:{session_id}"
    redis.delete(key)
    