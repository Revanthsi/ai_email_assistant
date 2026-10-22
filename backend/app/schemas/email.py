from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Intent(StrictModel):
    # Extensible label; unlike priority it is not tied to a fixed UI enum.
    category: str = Field(min_length=1, max_length=80, pattern=r"^[a-z][a-z0-9_]*$")
    reason: str = Field(min_length=1, max_length=600)


class Priority(StrictModel):
    level: Literal["urgent", "high", "normal", "low"]
    reason: str = Field(min_length=1, max_length=600)


class ExtractedAction(StrictModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=1000)
    deadline: date | None
    deadline_confidence: Literal["explicit", "uncertain", "unknown"]
    completion_requirement: str = Field(min_length=1, max_length=600)
    evidence: str = Field(min_length=1, max_length=600)
    reason: str = Field(min_length=1, max_length=600)

    @model_validator(mode="after")
    def validate_deadline(self):
        if self.deadline_confidence != "explicit" and self.deadline is not None:
            raise ValueError("Ambiguous or absent deadlines must be null")
        if self.deadline_confidence == "explicit" and self.deadline is None:
            raise ValueError("Explicit deadlines require a date")
        return self


class Analysis(StrictModel):
    summary: str = Field(min_length=1, max_length=2000)
    intent: Intent
    priority: Priority
    action_items: list[ExtractedAction] = Field(max_length=12)
    recommended_action: str = Field(min_length=1, max_length=600)


class BatchRequest(StrictModel):
    message_ids: list[str] = Field(min_length=1, max_length=5)


class TaskInput(StrictModel):
    title: str = Field(min_length=1, max_length=160)
    dueDate: date | None = None
    priority: Literal["urgent", "high", "normal", "medium", "low"] = "normal"


class TaskPatch(StrictModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    dueDate: date | None = None
    priority: Literal["urgent", "high", "normal", "medium", "low"] | None = None
    status: Literal["pending", "completed"] | None = None
    deleted: bool | None = None
    reminderDismissed: bool | None = None


class Preferences(StrictModel):
    analysisConsent: bool = False
