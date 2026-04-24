from django.urls import path
from . import views

urlpatterns = [
    path('', views.detection_page),
    path('detection/', views.detection_page),
    path('api/detect-emotion/', views.detect_emotion),
    path('api/recommend-songs/', views.recommend_songs),   # 👈 NEW
]