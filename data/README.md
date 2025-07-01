# MoneyMosaic Database

This directory contains the SQLite database files for MoneyMosaic.

## Security Notice

⚠️ **Database files are excluded from git** because they contain sensitive financial data:
- Plaid access tokens (API credentials)
- Bank account information
- Personal transaction data

## Database Initialization

The database will be automatically created when you first run the application:

```bash
npm start
```

## Development

For testing, each test creates its own temporary database file that is automatically cleaned up.

## Backup

If you need to backup your data, make sure to:
1. Keep backups in a secure location
2. Never commit database files to version control
3. Use encryption for sensitive data storage
