from django.db import models

class BackendLog(models.Model):
    level = models.CharField(max_length=20)
    message = models.TextField()
    module = models.CharField(max_length=200, null=True, blank=True)
    function_name = models.CharField(max_length=200, null=True, blank=True)
    traceback = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "backend_log"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.created_at} {self.level}"
