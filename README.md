# Forum API

REST API untuk platform forum diskusi, dibangun dengan **Node.js + Express** menggunakan prinsip **Clean Architecture** dan **Test-Driven Development (TDD)**.

**Production URL**: https://giant-foxes-lead-noisily.st.a.dcdg.xyz

---

## Fitur

- Autentikasi pengguna (register, login, logout, refresh token)
- Manajemen thread forum
- Komentar pada thread
- Balasan (reply) pada komentar
- Rate limiting 90 request/menit pada endpoint `/threads`
- HTTPS dengan SSL/TLS

---

## Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v13+
- npm

---

## Development

### 1. Clone Repository

```bash
git clone https://github.com/fauzan-arift/forum-api-dicoding.git
cd forum-api-dicoding
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Database PostgreSQL

Buka PostgreSQL dan jalankan:

```sql
CREATE DATABASE forumapi;
CREATE DATABASE forumapi_test;
```

### 4. Konfigurasi Environment

Buat file **`.env`** di root project:

```env
# HTTP SERVER
HOST=localhost
PORT=5000

# POSTGRES
PGHOST=localhost
PGUSER=postgres
PGDATABASE=forumapi
PGPASSWORD=your_password
PGPORT=5432

# TOKEN
ACCESS_TOKEN_KEY=your_access_token_secret_key_min_32_chars
REFRESH_TOKEN_KEY=your_refresh_token_secret_key_min_32_chars
ACCESS_TOKEN_AGE=3000
```

Buat file **`.test.env`** di root project (untuk database test):

```env
# HTTP SERVER
HOST=localhost
PORT=5000

# POSTGRES TEST
PGHOST=localhost
PGUSER=postgres
PGDATABASE=forumapi_test
PGPASSWORD=your_password
PGPORT=5432

# TOKEN
ACCESS_TOKEN_KEY=your_access_token_secret_key_min_32_chars
REFRESH_TOKEN_KEY=your_refresh_token_secret_key_min_32_chars
ACCESS_TOKEN_AGE=3000
```

### 5. Jalankan Migrasi Database

```bash
# Migrasi database utama
npm run migrate up

# Migrasi database test
npm run migrate:test up
```

### 6. Jalankan Server (Development)

```bash
npm run start:dev
```

Server berjalan di: **http://localhost:5000**

---

## Testing

```bash
# Jalankan semua test (sekali)
npm test

# Jalankan test mode watch
npm run test:watch

# Jalankan test dengan coverage
npm run test:coverage
```

---

## Production

### Infrastruktur

| Komponen | Detail |
|----------|--------|
| Server | AWS EC2 (Ubuntu) |
| Process Manager | PM2 |
| Reverse Proxy | NGINX |
| SSL | Let's Encrypt (Certbot) |
| Database | PostgreSQL |

### Setup Server

```bash
# Install dependencies
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Install Node.js & PM2
npm install -g pm2

# Clone repository
git clone https://github.com/fauzan-arift/forum-api-dicoding.git ~/forum-api-dicoding
cd ~/forum-api-dicoding

# Install production dependencies
npm ci --omit=dev

# Buat file .env (isi dengan konfigurasi production)
nano .env

# Jalankan migrasi
npm run migrate up

# Jalankan app dengan PM2
pm2 start src/app.js --name forum-api
pm2 save
pm2 startup
```

### NGINX Configuration

NGINX dikonfigurasi sebagai reverse proxy dengan rate limiting.
File konfigurasi tersedia di `nginx.conf` di root project.

Fitur NGINX:
- **Rate Limiting**: Maksimal 90 request/menit per IP untuk endpoint `/threads`
- **HTTPS**: SSL/TLS managed by Certbot (Let's Encrypt)
- **HTTP → HTTPS Redirect**: Semua request HTTP dialihkan ke HTTPS

```bash
# Copy config ke NGINX
sudo cp nginx.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

### CI/CD Pipeline

| Workflow | Trigger | Aksi |
|----------|---------|------|
| **Continuous Integration** | Pull Request ke `main` | Jalankan Unit Test, Integration Test, Functional Test |
| **Continuous Deployment** | Push ke `main` | SSH ke server, pull latest code, restart app |

GitHub Secrets yang dibutuhkan untuk CD:

| Secret | Keterangan |
|--------|-----------|
| `SSH_HOST` | IP public server |
| `SSH_USERNAME` | Username SSH server |
| `SSH_PASSWORD` | Password SSH server |

### Jalankan Server (Production)

```bash
# Start
pm2 start forum-api

# Stop
pm2 stop forum-api

# Restart
pm2 restart forum-api

# Lihat logs
pm2 logs forum-api
```

---

## Struktur Project

```
forum-api/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Continuous Integration
│       └── cd.yml          # Continuous Deployment
├── migrations/             # Database migrations
├── src/
│   ├── Applications/       # Use cases & business logic
│   ├── Commons/            # Shared utilities & exceptions
│   ├── Domains/            # Domain entities & repositories
│   ├── Infrastructures/    # Database, HTTP server, external services
│   └── Interfaces/         # HTTP handlers & routes
├── tests/                  # Test helpers
├── nginx.conf              # NGINX configuration
├── .env                    # Environment variables (development)
└── .test.env               # Environment variables (testing)
```