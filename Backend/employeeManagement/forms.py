from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import TblEmployeeMaster

class EmployeeCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm password", widget=forms.PasswordInput)

    class Meta:
        model = TblEmployeeMaster
        fields = (
            "email_id",
            "employee_name",
            "department",
            "is_staff",
            "is_superuser",
            "is_active_raw",
        )

    def clean_email_id(self):
        email = (self.cleaned_data.get("email_id") or "").strip().lower()
        if not email:
            raise forms.ValidationError("Email is required.")
        return email

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 != p2:
            raise forms.ValidationError("Passwords do not match.")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email_id = (user.email_id or "").strip().lower()
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class EmployeeChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(
        label="Password",
        help_text="Raw passwords are not stored. Use the Change password button."
    )

    class Meta:
        model = TblEmployeeMaster
        fields = (
            "email_id",
            "password",
            "employee_name",
            "department",
            "role",
            "is_staff",
            "is_superuser",
            "is_active_raw",
            "last_login",
        )

    def clean_email_id(self):
        email = (self.cleaned_data.get("email_id") or "").strip().lower()
        if not email:
            raise forms.ValidationError("Email is required.")
        return email

    def clean_password(self):
        return self.initial.get("password")
