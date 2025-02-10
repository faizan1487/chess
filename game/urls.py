from django.urls import path
from . import views
urlpatterns = [
    path('',views.chooseMode,name='chooseMode'),
    path('play',views.playLocal,name='playLocal'),
    path('ai',views.playAI,name='playAI'),
    path('board',views.board),
    path('reset',views.resetBoard,name='resetBoard'),
    path('chat_with_ai/', views.chat_with_ai, name='chat_with_ai'),
]
