"""
backend/logging_config.py
Structured logging configuration with JSON formatting and request tracing.
Produces machine-readable JSON logs for production aggregators (CloudWatch, Loki, ELK)
with transparent fallback to console formatting in local development.
"""

import logging
import sys
from datetime import datetime, timezone


def setup_logging(level: int = logging.INFO, json_format: bool = False):
    """Configure root logger with structured JSON or high-visibility standard formatting."""
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers on re-init
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(level)

    if json_format:
        try:
            from pythonjsonlogger import jsonlogger

            class CustomJsonFormatter(jsonlogger.JsonFormatter):
                def add_fields(self, log_record, record, message_dict):
                    super().add_fields(log_record, record, message_dict)
                    if not log_record.get("timestamp"):
                        log_record["timestamp"] = datetime.now(timezone.utc).isoformat()
                    if log_record.get("level"):
                        log_record["level"] = log_record["level"].upper()
                    else:
                        log_record["level"] = record.levelname

            formatter = CustomJsonFormatter(
                "%(timestamp)s %(level)s %(name)s %(message)s"
            )
            stream_handler.setFormatter(formatter)
        except Exception:
            # Fallback to standard if jsonlogger isn't ready
            formatter = logging.Formatter(
                "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            stream_handler.setFormatter(formatter)
    else:
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        stream_handler.setFormatter(formatter)

    root_logger.addHandler(stream_handler)

    # Quiet noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("apscheduler").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    return root_logger
