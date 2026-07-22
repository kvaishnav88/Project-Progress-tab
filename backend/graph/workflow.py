from langgraph.graph import END, START, StateGraph

from graph.nodes import (
    analyze_telemetry,
    decide_adaptation,
    build_prompt,
    generate_component,
)
from graph.state import GraphState


builder = StateGraph(GraphState)

builder.add_node("analyze", analyze_telemetry)
builder.add_node("decision", decide_adaptation) 
builder.add_node("prompt", build_prompt)
builder.add_node("generate", generate_component)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "decision")
builder.add_edge("decision", "prompt")
builder.add_edge("prompt", "generate")
builder.add_edge("generate", END)

workflow = builder.compile()