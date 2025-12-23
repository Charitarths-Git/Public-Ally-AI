from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import CallHistory, CallingSession
import time
import random
import uuid


class Command(BaseCommand):
    help = 'Starts a background task to simulate calls every 2 minutes'
    
    # Predefined summaries for different scenarios
    SUMMARIES = [
        "Citizen inquired about PM Kisan scheme eligibility. Provided information about required documents and application process.",
        "Query regarding Ayushman Bharat card application. Explained the registration procedure and benefits.",
        "Asked about traffic violation fine payment options. Guided citizen to the official website and payment methods.",
        "Inquiry about voter ID card status. Provided information about tracking application and verification process.",
        "Discussed ration card renewal process. Explained documents needed and where to submit application.",
        "Query about pension scheme for senior citizens. Provided details about applicable schemes and registration.",
        "Asked about Right to Information (RTI) filing procedure. Explained the process and required information.",
        "Inquiry about government scholarship programs for students. Provided information about available schemes.",
        "Discussed property tax payment options. Guided citizen to municipal corporation website.",
        "Query about PAN card application status. Provided information about tracking and helpline numbers.",
    ]
    
    # Sample phone numbers for simulation
    SAMPLE_PHONES = [
        "+919876543210", "+919876543211", "+919876543212", "+919876543213", "+919876543214",
        "+919876543215", "+919876543216", "+919876543217", "+919876543218", "+919876543219",
    ]
    
    # Sample names
    SAMPLE_NAMES = [
        "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sunita Verma", "Ravi Singh",
        "Anita Desai", "Vikram Reddy", "Meena Iyer", "Suresh Gupta", "Kavita Joshi",
    ]
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=120,  # 2 minutes in seconds
            help='Interval in seconds between simulated calls (default: 120)'
        )
    
    def handle(self, *args, **options):
        interval = options['interval']
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('🚀 CALL SIMULATION SERVICE STARTED'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'⏰ Simulating calls every {interval} seconds ({interval/60} minutes)'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
        
        call_count = 0
        
        try:
            while True:
                call_count += 1
                
                # Generate random call data
                phone_number = random.choice(self.SAMPLE_PHONES)
                customer_name = random.choice(self.SAMPLE_NAMES)
                status = random.choice(['ended', 'busy', 'no-answer', 'ended', 'ended'])
                duration = random.randint(30, 300) if status == 'ended' else 0
                summary = random.choice(self.SUMMARIES) if status == 'ended' else None
                call_id = f"call_{uuid.uuid4().hex[:16]}"
                
                # Create call history entry
                call_history = CallHistory.objects.create(
                    call_id=call_id,
                    phone_number=phone_number,
                    customer_name=customer_name,
                    status=status,
                    duration=duration,
                    summary=summary,
                    started_at=timezone.now(),
                    ended_at=timezone.now() if status in ['ended', 'busy', 'no-answer'] else None
                )
                
                # Update active session if exists
                active_session = CallingSession.objects.filter(is_active=True).first()
                if active_session:
                    active_session.total_calls += 1
                    if status == 'ended':
                        active_session.successful_calls += 1
                    else:
                        active_session.failed_calls += 1
                    active_session.save()
                
                # Print log
                self.stdout.write('')
                self.stdout.write(self.style.SUCCESS(f'📞 Call #{call_count} Simulated'))
                self.stdout.write(f'   ID: {call_id}')
                self.stdout.write(f'   Phone: {phone_number}')
                self.stdout.write(f'   Name: {customer_name}')
                self.stdout.write(f'   Status: {status}')
                if duration > 0:
                    self.stdout.write(f'   Duration: {duration}s')
                if summary:
                    self.stdout.write(f'   Summary: {summary[:80]}...')
                self.stdout.write(f'   Time: {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}')
                self.stdout.write('-' * 60)
                
                # Wait for the specified interval
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('\n⚠️ Stopping call simulation...'))
            self.stdout.write(self.style.SUCCESS(f'✅ Total calls simulated: {call_count}'))
            self.stdout.write(self.style.SUCCESS('👋 Call simulation service stopped\n'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}\n'))
            raise
