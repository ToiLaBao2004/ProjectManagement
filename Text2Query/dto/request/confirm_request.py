from pydantic import BaseModel
from typing import Optional

class ConfirmRequest(BaseModel):
    new_prompt: Optional[str]=None
    is_confirm: bool