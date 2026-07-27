class DecisionEngine:
    """
    Decide how the UI should adapt based on cognitive load.
    """

    def decide(self, strategy: str) -> dict:

        decisions = {
            "low_cognitive_load": {
                "layout": "standard",
                "spacing": "normal",
                "buttons": "standard",
                "secondary_actions": True,
                "visual_complexity": "normal",
            },

            "medium_cognitive_load": {
                "layout": "simplified",
                "spacing": "comfortable",
                "buttons": "large",
                "secondary_actions": True,
                "visual_complexity": "reduced",
            },

            "high_cognitive_load": {
                "layout": "minimal",
                "spacing": "large",
                "buttons": "extra_large",
                "secondary_actions": False,
                "visual_complexity": "minimal",
            },
        }

        return decisions.get(strategy, decisions["low_cognitive_load"])