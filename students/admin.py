from django.contrib import admin
from .models import Student, Subject, Enrollment, Grade

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'first_name', 'last_name', 'email', 'enrollment_date', 'is_active']
    list_filter = ['is_active', 'enrollment_date']
    search_fields = ['student_id', 'first_name', 'last_name', 'email']
    ordering = ['last_name', 'first_name']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'credits', 'is_active']
    list_filter = ['is_active', 'credits']
    search_fields = ['code', 'name']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'enrollment_date', 'is_active']
    list_filter = ['is_active', 'enrollment_date']
    search_fields = ['student__first_name', 'student__last_name', 'subject__name']

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'grade_type', 'title', 'score', 'max_score', 'percentage', 'date_recorded']
    list_filter = ['grade_type', 'date_recorded']
    search_fields = ['enrollment__student__first_name', 'enrollment__student__last_name', 'title']
