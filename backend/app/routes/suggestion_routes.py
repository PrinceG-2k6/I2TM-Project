from fastapi import APIRouter, status

from app.controllers import suggestion_controller
from app.schemas.suggestion_schema import SignalSuggestionCreate, SignalSuggestionResponse


router = APIRouter(prefix="/suggestions", tags=["Signal Suggestions"])


@router.post(
    "",
    response_model=SignalSuggestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_signal_suggestion(payload: SignalSuggestionCreate) -> dict:
    return suggestion_controller.create_suggestion(payload.model_dump())
