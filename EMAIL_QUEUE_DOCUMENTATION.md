# Email Queue System - Automated Processing

## Overview
The email notification system is now fully automated with periodic processing via cron jobs. Users will receive timely email notifications for applications, opportunities, and other events.

## Automated Processing Schedule

### Main Email Processing
- **Frequency**: Every 3 minutes
- **Function**: `cleanup_and_process_emails()`
- **What it does**:
  - Processes up to 5 pending emails per run
  - Respects 5-second delay for rate limiting
  - Adds 1-second delay between emails
  - Retries failed emails up to 3 times
  - Cleans up old processed emails (7+ days)

### Daily Cleanup
- **Frequency**: Daily at 2:00 AM
- **What it does**: Removes old email records (30+ days) to keep the queue table manageable

## Email Processing Flow

1. **Trigger**: User action (new application, status update, etc.)
2. **Queue**: Email added to `email_queue` table with `status = 'pending'`
3. **Processing**: Cron job picks up pending emails and calls Edge Function
4. **Delivery**: Email sent via Resend API
5. **Status Update**: Email marked as `sent` or `failed`

## Monitoring Functions

### Check Queue Status
```sql
SELECT public.get_email_queue_status();
```
Returns:
- Number of pending emails
- Emails sent in last 24 hours
- Failed email count
- Queue health status
- Timestamps

### Manual Processing (if needed)
```sql
-- Process current batch
SELECT public.cleanup_and_process_emails();

-- Force process all pending emails
SELECT public.force_process_all_emails();
```

## Expected Email Timing

- **New Applications**: 1-6 minutes after submission
- **Application Updates**: 1-6 minutes after status change
- **New Opportunities**: 1-6 minutes after posting
- **New Messages**: 1-6 minutes after sending

## System Health Indicators

### Healthy Queue
- Pending emails < 10 minutes old
- No failed emails accumulating
- Regular processing (check `last_email_sent` timestamp)

### Potential Issues
- Pending emails > 10 minutes old
- High number of failed emails
- No recent email activity

## Troubleshooting

### If emails are stuck in pending
1. Check queue status: `SELECT public.get_email_queue_status();`
2. Force processing: `SELECT public.force_process_all_emails();`
3. Check cron jobs: `SELECT * FROM cron.job;`

### If users report not receiving emails
1. Check spam folders
2. Verify email preferences in user profiles
3. Check email queue for sent status
4. Verify Resend API is working

## Database Tables

### email_queue
- `id`: Unique identifier
- `email_type`: Type of notification
- `recipient_email`: Target email address
- `recipient_name`: Recipient display name
- `email_data`: JSON data for email content
- `status`: pending | sent | failed
- `attempts`: Number of send attempts
- `created_at`: When email was queued
- `processed_at`: When email was sent/failed

## Cron Jobs Setup

The system uses PostgreSQL's `pg_cron` extension:

```sql
-- Email processing (every 3 minutes)
SELECT cron.schedule(
    'process-email-queue',
    '*/3 * * * *',
    'SELECT public.cleanup_and_process_emails();'
);

-- Daily cleanup (2 AM daily)
SELECT cron.schedule(
    'daily-email-cleanup',
    '0 2 * * *',
    'DELETE FROM public.email_queue WHERE status IN (''sent'', ''failed'') AND processed_at < NOW() - INTERVAL ''30 days'';'
);
```

## Maintenance

The system is designed to be self-maintaining:
- Automatic retry of failed emails
- Automatic cleanup of old records
- Rate limiting to prevent API issues
- Error handling and logging

No regular maintenance should be required. Monitor occasionally using the status functions if needed. 