# Render (Frontend) + InfinityFree (Backend) — Setup Guide

## Your 2 URLs

| Service | Example URL |
|---------|-------------|
| **Render** (frontend) | `https://fraudshield.onrender.com` |
| **InfinityFree** (backend) | `https://yoursite.infinityfreeapp.com/backend` |

---

## PART A — InfinityFree (Backend)

### 1. Upload `backend/` folder
Upload to: `htdocs/backend/` on InfinityFree

### 2. Create `backend/config/config.local.php`
Copy from `config.local.php.example` and fill in:

```php
define('DB_HOST', 'sqlXXX.infinityfree.com');     // from InfinityFree MySQL panel
define('DB_NAME', 'if0_XXXXXX_fraudshield');
define('DB_USER', 'if0_XXXXXX');
define('DB_PASS', 'your_password');
define('JWT_SECRET', 'any-long-random-string-12345');
define('CORS_ORIGIN', 'https://YOUR-RENDER-APP.onrender.com');
```

### 3. Database already created? Run this if login fails
In phpMyAdmin → SQL tab → paste and run `database/fix_passwords.sql`:

```sql
UPDATE users SET password_hash = '$2y$12$AKtw4DYUhk7Gkn0EZHPpCeYqDJo9FNLm9qSc9jI/72hwDeq5QyS4.';
```

This sets **all users password to:** `password`

### 4. Test backend works
Open in browser:
```
https://YOUR-SITE.infinityfreeapp.com/backend/api/health.php
```
Should show: `"database":"connected"` and user count.

Test login with browser dev tools or Postman:
```
POST https://YOUR-SITE.infinityfreeapp.com/backend/api/auth/login.php
Body: {"email":"admin@fraudshield.ai","password":"password"}
```
Should return `"success":true` and a `token`.

---

## PART B — Render (Frontend)

### 1. Edit `frontend/public/config.json`
```json
{
  "API_BASE_URL": "https://YOUR-SITE.infinityfreeapp.com/backend"
}
```
Replace with your **real InfinityFree URL**. No trailing slash.

### 2. Re-deploy on Render
- Root: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`

**Optional** env var (instead of config.json):
```
VITE_API_BASE_URL=https://YOUR-SITE.infinityfreeapp.com/backend
```

### 3. Login credentials
| Email | Password |
|-------|----------|
| admin@fraudshield.ai | password |
| john@example.com | password |

New users: register → login with the email/password they created.

---

## Checklist if login still fails

- [ ] `health.php` shows database connected on InfinityFree
- [ ] `config.local.php` exists on InfinityFree with correct MySQL details
- [ ] Ran `fix_passwords.sql` in phpMyAdmin
- [ ] `config.json` on Render has correct InfinityFree URL (re-deploy after editing)
- [ ] `CORS_ORIGIN` in config.local.php matches your Render URL exactly
- [ ] Users exist in phpMyAdmin `users` table
