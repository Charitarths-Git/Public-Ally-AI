from django.db import models
from django.utils import timezone


class CallHistory(models.Model):
    """Model to store call history records"""
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('ringing', 'Ringing'),
        ('in-progress', 'In Progress'),
        ('forwarding', 'Forwarding'),
        ('ended', 'Ended'),
        ('busy', 'Busy'),
        ('no-answer', 'No Answer'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
    ]
    
    call_id = models.CharField(max_length=255, unique=True, db_index=True)
    phone_number = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    duration = models.IntegerField(default=0, help_text='Call duration in seconds')
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    summary = models.TextField(blank=True, null=True)
    transcript = models.TextField(blank=True, null=True)
    recording_url = models.URLField(blank=True, null=True)
    assistant_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Call History'
        verbose_name_plural = 'Call Histories'
        
    def __str__(self):
        return f"{self.phone_number} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class CallingSession(models.Model):
    """Model to track calling sessions"""
    
    session_id = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=False)
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_calls = models.IntegerField(default=0)
    successful_calls = models.IntegerField(default=0)
    failed_calls = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = 'Calling Session'
        verbose_name_plural = 'Calling Sessions'
        
    def __str__(self):
        return f"Session {self.session_id} - {'Active' if self.is_active else 'Ended'}"
