from django.db import models

class VarCharCharField(models.CharField):
    def db_type(self, connection):
        return f"varchar({self.max_length})"