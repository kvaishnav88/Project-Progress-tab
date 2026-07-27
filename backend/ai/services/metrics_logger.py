from ai.logger import logger


class MetricsLogger:
    """
    Log a summary of each AI generation request.
    """

    def log_summary(self, state: dict) -> None:
        logger.info("=" * 60)
        logger.info("AI Request Summary")

        logger.info(
            "Component        : %s",
            state["telemetry"].component_name,
        )

        logger.info(
            "Strategy         : %s",
            state["strategy"],
        )

        logger.info(
            "Prompt Type      : %s",
            state["prompt_type"],
        )

        logger.info(
            "Validation       : %s",
            "PASS" if state["is_valid"] else "FAIL",
        )

        logger.info(
            "Generation Time  : %.2f sec",
            state["generation_time"],
        )

        if state["errors"]:
            logger.warning(
                "Validation Errors: %s",
                state["errors"],
            )

        logger.info("=" * 60)