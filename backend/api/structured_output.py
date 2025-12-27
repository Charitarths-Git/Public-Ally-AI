from pydantic import BaseModel, Field

class ToolMetadata(BaseModel):
    tool_name: str = Field(description="A short, underscored name for the tool, e.g., 'farmer_records'")
    summary: str = Field(description="A 2-sentence summary of the database content for an AI agent including the clumns names, what type of data each column has and when the database should be used for data retrieval by the agent.")