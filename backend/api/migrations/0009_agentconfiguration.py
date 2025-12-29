# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_humanexpert_updated_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AgentConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='LokMitra', max_length=255)),
                ('description', models.TextField(default='LokMitra is an AI voice agent serving the public to help people through voice interactions and knowledge access.')),
                ('tool_settings', models.JSONField(blank=True, default=dict)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Agent Configuration',
                'verbose_name_plural': 'Agent Configurations',
            },
        ),
    ]
