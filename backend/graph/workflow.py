from langgraph.graph import END, START, StateGraph

from graph.nodes import (
    analyze_telemetry,
    decide_adaptation,
    choose_prompt,
    build_standard_prompt_node,
    build_adaptive_prompt,
    generate_component,
)
from graph.state import GraphState


builder = StateGraph(GraphState)

builder.add_node("analyze", analyze_telemetry)
builder.add_node("decision", decide_adaptation) 
builder.add_node(
    "adaptive_prompt",
    build_adaptive_prompt,
)

builder.add_node(
    "standard_prompt",
    build_standard_prompt_node,
)
builder.add_node("generate", generate_component)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "decision")

builder.add_conditional_edges(
    "decision",
    choose_prompt,
    {
        "standard_prompt": "standard_prompt",
        "adaptive_prompt": "adaptive_prompt",
    },
)

builder.add_edge("adaptive_prompt", "generate")
builder.add_edge("standard_prompt", "generate")
builder.add_edge("generate", END)

workflow = builder.compile()