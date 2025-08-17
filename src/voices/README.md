# Voices Module

This module handles voice retrieval for the MusicGPT application.

## API Endpoints

### GET /voices

Get voices with pagination and filtering

- **Query Parameters:**
  - `language` (optional): Filter by language (english, nepali, indian)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 15, max: 100)

## Data Structure

```typescript
// Voice model
interface Voice {
  id: string;
  name: string;
  language: 'english' | 'nepali' | 'indian';
  createdAt: Date;
  updatedAt: Date;
}
```

## Response Format

```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "123",
        "name": "Emma Watson",
        "language": "english",
        "createdAt": "2025-08-14T12:27:46.545Z",
        "updatedAt": "2025-08-14T12:27:46.545Z"
      }
      // more voices...
    ],
    "pagination": {
      "total": 30,
      "page": 1,
      "limit": 15,
      "pages": 2
    }
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-08-14T16:00:00.000Z"
}
```

## Usage Examples

```bash
# Get all voices (first page, 15 per page)
GET /voices

# Get voices by language
GET /voices?language=english

# Get page 2 with 10 voices per page
GET /voices?page=2&limit=10

# Combined filtering and pagination
GET /voices?language=nepali&page=1&limit=3
```
