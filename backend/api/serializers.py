from rest_framework import serializers
from .models import CallHistory, CallingSession


class CallHistorySerializer(serializers.ModelSerializer):
    """Serializer for Call History"""
    
    class Meta:
        model = CallHistory
        fields = '__all__'
        read_only_fields = ['call_id', 'created_at', 'updated_at']


class CallingSessionSerializer(serializers.ModelSerializer):
    """Serializer for Calling Session"""
    
    class Meta:
        model = CallingSession
        fields = '__all__'
        read_only_fields = ['session_id', 'started_at', 'created_at']
