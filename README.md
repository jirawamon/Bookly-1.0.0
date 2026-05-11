# Bookly-1.0.0

## Project Description
Bookly is a Node.js + Express book store demo with a static frontend and a REST API. It supports product browsing, authentication, and checkout with orders stored in SQLite and JSON snapshots.

## Architecture Overview
This project follows a Controller-Route-Service-Repository pattern:
- Routes define HTTP endpoints.
- Controllers handle request/response formatting.
- Services implement business rules.
- Repositories read/write storage (SQLite and JSON).

## Folder Structure
- controllers/ - HTTP controllers
- routes/ - Express routes
- services/ - Business logic
- repositories/ - Data access (JSON/SQLite)
- config/ - Database configuration
- js/ - Frontend scripts
- images/ - UI assets

## Setup Instructions
1. Install dependencies:
   npm install
2. Create .env from .env.example and fill values.
3. Start the server:
   npm start
4. Open http://localhost:3000

## Environment Variables
See .env.example for required keys:
- PORT - server port
- NODE_ENV - development or production
- JWT_SECRET - JWT signing secret
- DB_PATH - relative path to SQLite db

Never commit real secrets. Copy .env.example to .env and replace JWT_SECRET before production.

## API Endpoints
- GET /api/products?category=...
- POST /api/login
- POST /api/register
- POST /api/checkout
- POST /api/orders

## Go-Live Audit Checklist
- [ ] .env configured with strong JWT_SECRET
- [ ] DB_PATH set and SQLite file not committed
- [ ] Production NODE_ENV enabled
- [ ] JWT tokens expire and secret not hard-coded
- [ ] Input validation active for auth/checkout
- [ ] Error responses do not expose stack traces
- [ ] .gitignore blocks secrets and db files
- [ ] npm install && npm start works on clean machine
