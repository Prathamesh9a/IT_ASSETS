import threading

_thread_local = threading.local()

def set_request_context(request):
    _thread_local.request = request

def get_request_context():
    return getattr(_thread_local, "request", None)

class RequestContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_request_context(request)
        try:
            return self.get_response(request)
        finally:
            set_request_context(None)
