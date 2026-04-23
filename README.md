# Forum API

REST API untuk platform forum diskusi, dibangun dengan **Node.js + Express** menggunakan prinsip **Clean Architecture** dan **Test-Driven Development (TDD)**.

---

## Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v13+
- npm

---

## Cara Menjalankan dari Awal

### 1. Buat Database PostgreSQL

Buka PostgreSQL dan jalankan:

```sql
CREATE DATABASE forumapi;
CREATE DATABASE forumapi_test;
```

### 2. Konfigurasi Environment

Edit file **`.env`** di root project:

```env
# HTTP SERVER
HOST=localhost
PORT=3000

# POSTGRES
PGHOST=localhost
PGUSER=postgres
PGDATABASE=forumapi
PGPASSWORD=your_password
PGPORT=5432

# TOKEN
ACCESS_TOKEN_KEY=your_access_token_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key
ACCESS_TOKEN_AGE=3000
```

Edit file **`.test.env`** di root project (untuk database test):

```env
# HTTP SERVER
HOST=localhost
PORT=3000

# POSTGRES TEST
PGHOST=localhost
PGUSER=postgres
PGDATABASE=forumapi_test
PGPASSWORD=your_password
PGPORT=5432

# TOKEN
ACCESS_TOKEN_KEY=your_access_token_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key
ACCESS_TOKEN_AGE=3000
```

### 4. Jalankan Migrasi Database

```bash
# Migrasi database utama (production/dev)
npm run migrate up

# Migrasi database test
npm run migrate:test up
```

### 5. Jalankan Server

```bash
# Production
npm start

# Development (auto-reload)
npm run start:dev
```

Server berjalan di: **http://localhost:3000**

---

## Menjalankan Tests

```bash
# Jalankan semua test (sekali)
npm test

# Jalankan test mode watch
npm run test:watch

# Jalankan test dengan coverage
npm run test:coverage
```
