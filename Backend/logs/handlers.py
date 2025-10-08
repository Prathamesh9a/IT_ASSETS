import logging
import traceback
from django.apps import apps
from .context import get_request_context

class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        try:
            # App must be installed and model must exist
            try:
                BackendLog = apps.get_model("logs", "BackendLog")
            except Exception:
                return

            tb = None
            if record.exc_info:
                tb = "".join(traceback.format_exception(*record.exc_info))

            req = get_request_context()
            ip = req.META.get("REMOTE_ADDR") if req else None
            agent = req.META.get("HTTP_USER_AGENT") if req else None

            BackendLog.objects.create(
                level=record.levelname,
                message=record.getMessage(),
                module=record.module,
                function_name=getattr(record, "funcName", None),
                traceback=tb,
                ip_address=ip,
                user_agent=agent,
            )
        except Exception:
            # Never raise from logger
            pass
