import logging
import traceback
from django.apps import apps
from threading import local

# Local thread for request storage
_request_storage = local()

def set_request_context(request):
    _request_storage.request = request

def get_request_context():
    return getattr(_request_storage, 'request', None)


class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        try:
            BackendLog = apps.get_model('logs', 'BackendLog')

            tb = None
            if record.exc_info:
                tb = "".join(traceback.format_exception(*record.exc_info))

            # request info (IP & User-Agent)
            request = get_request_context()
            ip = request.META.get('REMOTE_ADDR') if request else None
            agent = request.META.get('HTTP_USER_AGENT') if request else None

            if record is not None:
                BackendLog.objects.create(
                    level=record.levelname,
                    message=record.getMessage(),
                    module=record.module,
                    function_name=record.funcName,
                    traceback=tb,
                    ip_address=ip,
                    user_agent=agent
                )

           
        except Exception:
            import sys
            print("Failed to log to DB", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)