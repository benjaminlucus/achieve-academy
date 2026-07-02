# Database Backups

## Overview
This document outlines the database backup strategy for Ravencrest Academy.

## Backup Strategy

### 1. Automated Backups (Production)
For production deployments, use MongoDB Atlas automated backups (if using Atlas) or configure cron-based backups.

### 2. Manual Backup Steps
To manually backup the database:

```bash
# Using mongodump
mongodump --uri "$MONGODB_URI" --out ./backups/$(date +%Y%m%d_%H%M%S)

# Or using mongodump with gzip compression
mongodump --uri "$MONGODB_URI" --gzip --out ./backups/$(date +%Y%m%d_%H%M%S)
```

### 3. Restore Steps
To restore from backup:

```bash
# Uncompress if needed
tar -xzf backup-file.tar.gz

# Restore
mongorestore --uri "$MONGODB_URI" ./path/to/backup/directory
```

## Retention Policy
- Daily backups: Retain 30 days
- Weekly backups: Retain 12 weeks
- Monthly backups: Retain 12 months

## Security
- Encrypt backups at rest
- Store backups in a separate geographic location
- Limit access to backup files
- Regularly test backup restoration

## Tools
Recommended tools for automated backups:
- [MongoDB Atlas Backups](https://www.mongodb.com/docs/atlas/backup/overview/) (for Atlas deployments)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) (for Vercel deployments)
- [AWS Backup](https://aws.amazon.com/backup/) (for AWS deployments)
- [GitHub Actions Cron](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
