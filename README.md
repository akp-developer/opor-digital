# OPOR Digital Backend

Backend service for OPOR Digital platform, providing authentication, user management, and multi-tenant support.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/akp-developer/opor-digital.git
cd opor-digital/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start development server:

```bash
npm run dev
```

## Features

- Authentication (JWT)
- Multi-tenant support
- User management
- Role-based access control
- MongoDB integration

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── core/           # Core functionality
│   ├── models/         # Database models
│   ├── modules/        # Feature modules
│   ├── types/          # TypeScript types
│   ├── scripts/        # Utility scripts
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── tests/             # Test files
└── docs/              # Documentation
```

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/refresh` - Refresh access token

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run build` - Build for production

## Contributing

1. Create your feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Create a Pull Request

## License

This project is licensed under the MIT License.
