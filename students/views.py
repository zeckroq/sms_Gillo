from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Student, Subject, Enrollment, Grade
from .serializers import (
    StudentSerializer, SubjectSerializer, 
    EnrollmentSerializer, GradeSerializer,
    StudentDetailSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentDetailSerializer
        return StudentSerializer

    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        student = self.get_object()
        enrollments = student.enrollments.filter(is_active=True)
        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def grades_summary(self, request, pk=None):
        student = self.get_object()
        enrollments = student.enrollments.filter(is_active=True)
        
        summary = []
        for enrollment in enrollments:
            grades = enrollment.grades.all()
            activities = grades.filter(grade_type='activity')
            quizzes = grades.filter(grade_type='quiz')
            exams = grades.filter(grade_type='exam')
            
            subject_summary = {
                'subject': enrollment.subject.name,
                'subject_code': enrollment.subject.code,
                'activities_avg': activities.aggregate(avg=Avg('score'))['avg'] or 0,
                'quizzes_avg': quizzes.aggregate(avg=Avg('score'))['avg'] or 0,
                'exams_avg': exams.aggregate(avg=Avg('score'))['avg'] or 0,
                'total_grades': grades.count(),
            }
            summary.append(subject_summary)
        
        return Response(summary)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        queryset = Enrollment.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        return queryset

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

    def get_queryset(self):
        queryset = Grade.objects.all()
        enrollment_id = self.request.query_params.get('enrollment_id', None)
        grade_type = self.request.query_params.get('grade_type', None)
        
        if enrollment_id is not None:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        if grade_type is not None:
            queryset = queryset.filter(grade_type=grade_type)
        
        return queryset
