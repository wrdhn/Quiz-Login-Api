# Quiz Auth API - Usage Examples

## Installation & Setup

```bash
# Install dependencies
npm install

# Create folder structure
mkdir config routes

# Copy the files to appropriate folders:
# - server.js (root)
# - config/database.js
# - routes/auth.js
# - .env (root)

# Run development server
npm run dev
```

## API Endpoints

### 1. Register User
**POST** `/register`

**Request Body:**
```json
{
    "username": "testuser",
    "password": "password123"
}
```

**Response (Success):**
```json
{
    "error": false,
    "message": "User registered successfully",
    "data": {
        "userId": 1,
        "username": "testuser",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### 2. Login User
**POST** `/login`

**Request Body:**
```json
{
    "username": "testuser",
    "password": "password123"
}
```

**Response (Success):**
```json
{
    "error": false,
    "message": "Login successful",
    "data": {
        "userId": 1,
        "username": "testuser",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

### 3. Verify Token
**GET** `/verify`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```json
{
    "error": false,
    "message": "Token is valid",
    "data": {
        "userId": 1,
        "username": "testuser"
    }
}
```

## cURL Examples

### Register
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Verify Token
```bash
curl -X GET http://localhost:3000/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Error Responses

### Validation Error (400)
```json
{
    "error": true,
    "message": "\"password\" length must be at least 6 characters long",
    "statusCode": 400
}
```

### Authentication Error (401)
```json
{
    "error": true,
    "message": "Invalid username or password",
    "statusCode": 401
}
```

### Server Error (500)
```json
{
    "error": true,
    "message": "Internal server error",
    "statusCode": 500
}
```

## Features

✅ **Joi Validation** - Username & password validation
✅ **Bcrypt Hashing** - Secure password storage
✅ **JWT Authentication** - Token-based auth
✅ **PostgreSQL Integration** - Using existing quiz_auth database
✅ **Error Handling** - Comprehensive error responses
✅ **CORS Support** - Cross-origin requests enabled

## Security Features

- Passwords di-hash dengan bcrypt (salt rounds: 10)
- JWT token dengan expiration time
- Input validation dengan Joi
- SQL injection protection dengan parameterized queries
- Proper error handling tanpa expose sensitive info