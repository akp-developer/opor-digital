# OPOR Digital Backend

Backend service for OPOR Digital platform, providing API endpoints for local administration management system.

## Project Structure

```
opor-digital/
└── backend/
    ├── src/
    │   ├── config/         # Configuration files
    │   ├── core/           # Core functionality
    │   ├── models/         # Database models
    │   ├── modules/        # Feature modules
    │   ├── types/          # TypeScript types
    │   ├── app.ts          # Express application
    │   └── server.ts       # Server entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values accordingly

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

### Authentication Endpoints
- POST /api/v1/auth/login
- POST /api/v1/auth/register

### User Management
- GET /api/v1/users
- POST /api/v1/users
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id

## Technologies
- Node.js
- Express
- TypeScript
- MongoDB
- Jest