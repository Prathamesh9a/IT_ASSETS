# import logging

# logger = logging.getLogger(__name__)

# def get_client_ip(request):
#     xff = request.META.get("HTTP_X_FORWARDED_FOR")
#     if xff:
#         return xff.split(",")[0].strip()
#     return request.META.get("REMOTE_ADDR")

# def set_request_context(request):
#     """
#     Lightweight helper to log requester context.
#     Safe no-op for your API if you only need it to exist.
#     """
#     try:
#         ip = get_client_ip(request)
#         ua = request.META.get("HTTP_USER_AGENT", "")
#         user = getattr(request, "user", None)
#         uname = str(user) if user and getattr(user, "is_authenticated", False) else "anonymous"
#         logger.info("reqctx ip=%s user=%s ua=%s", ip, uname, ua)
#     except Exception:
#         logger.debug("set_request_context skipped due to minor error", exc_info=True)
