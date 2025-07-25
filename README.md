# 🎥 Backend Project - Video & Social Platform API

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)
![Express.js](https://img.shields.io/badge/Express.js-5.1+-blue.svg)

A comprehensive backend API for a video and social media platform built with Node.js, Express.js, and MongoDB. This project demonstrates modern backend development practices including authentication, file uploads, social features, and robust API design.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with access and refresh tokens
- **Secure Password Hashing** using bcrypt
- **Session Management** with HTTP-only cookies
- **Protected Routes** with middleware authentication

### 📹 Video Management
- **Video Upload & Storage** via Cloudinary integration
- **Thumbnail Generation** and management
- **Video Metadata** (title, description, duration)
- **Publishing Controls** (draft/published status)

### 👥 User Management
- **User Registration/Login** with email and username
- **Profile Management** (avatar, cover image)
- **User Channel Profiles** with aggregated statistics
- **Watch History** tracking and retrieval

### 🎵 Playlist System
- **Create/Update/Delete** playlists
- **Add/Remove Videos** from playlists
- **Public/Private** playlist visibility

### 💬 Social Features
- **Comments System** on videos with CRUD operations
- **Like/Unlike** functionality for videos, comments, and tweets
- **Tweet System** for short-form content
- **Subscription System** for following channels
- **User Interactions** tracking and management

### 📊 Advanced Features
- **MongoDB Aggregation Pipelines** for complex queries
- **Pagination Support** for large datasets
- **File Upload Handling** with Multer middleware
- **Cloud Storage Integration** with Cloudinary
- **Error Handling** with custom error classes

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js v5.1
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Development**: Nodemon, Prettier

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for file storage)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Niranjan05Kumar/BackendProject.git
   cd BackendProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net
   
   # JWT Secrets
   ACCESS_TOKEN_SECRET=your-access-token-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Server Configuration
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v0
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Register new user |
| POST | `/users/login` | User login |
| POST | `/users/logout` | User logout |
| POST | `/users/refresh-token` | Refresh access token |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/get-current-user` | Get current user profile |
| PATCH | `/users/update-account-details` | Update user details |
| PATCH | `/users/update-user-avatar` | Update user avatar |
| PATCH | `/users/update-user-cover-image` | Update cover image |
| GET | `/users/c/:username` | Get user channel profile |
| GET | `/users/watch-history` | Get user watch history |

### Video Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/videos` | Get all videos |
| POST | `/videos/publish-video` | Upload new video |
| GET | `/videos/:videoId` | Get video by ID |
| PATCH | `/videos/update/:videoId` | Update video details |
| DELETE | `/videos/delete/:videoId` | Delete video |
| PATCH | `/videos/toggle-publish-status/:videoId` | Toggle publish status |

### Playlist Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/playlists/create` | Create new playlist |
| GET | `/playlists/user/:userId` | Get user playlists |
| GET | `/playlists/:playlistId` | Get playlist by ID |
| POST | `/playlists/add-video` | Add video to playlist |
| POST | `/playlists/remove-video` | Remove video from playlist |
| PUT | `/playlists/update/:playlistId` | Update playlist |
| DELETE | `/playlists/:playlistId` | Delete playlist |

### Social Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/comments/add-comment/:videoId` | Add comment to video |
| GET | `/comments/get-comments/:videoId` | Get video comments |
| POST | `/likes/like/video/:videoId` | Toggle video like |
| POST | `/likes/like/comment/:commentId` | Toggle comment like |
| PUT | `/subscriptions/subscription/:channelId` | Toggle subscription |
| GET | `/tweets` | Get user tweets |
| POST | `/tweets/create` | Create new tweet |

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── playlist.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── tweet.controller.js
│   └── subscription.controller.js
├── models/              # MongoDB schemas
│   ├── user.model.js
│   ├── video.model.js
│   ├── playlist.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── tweet.model.js
│   └── subscription.model.js
├── routes/              # API routes
│   ├── user.route.js
│   ├── video.route.js
│   ├── playlist.route.js
│   ├── comment.route.js
│   ├── like.route.js
│   ├── tweet.route.js
│   └── subscription.route.js
├── middlewares/         # Custom middleware
│   ├── auth.middleware.js
│   └── multer.middleware.js
├── utils/               # Utility functions
│   ├── apiError.js
│   ├── apiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
├── db/                  # Database configuration
│   └── index.js
├── app.js              # Express app configuration
├── index.js            # Server entry point
└── constants.js        # Application constants
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=8000
MONGO_URI=your-production-mongodb-uri
ACCESS_TOKEN_SECRET=your-secure-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📈 Performance Considerations

- **Database Indexing**: Optimized MongoDB indexes for fast queries
- **Aggregation Pipelines**: Efficient data processing and filtering
- **File Upload Optimization**: Cloudinary integration for fast file serving
- **Pagination**: Implemented for large datasets
- **Caching Strategy**: Ready for Redis integration


## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success message",
  "success": true
}
```

Error responses:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

## 🔮 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Advanced search with Elasticsearch
- [ ] Content moderation system
- [ ] Analytics dashboard
- [ ] Rate limiting and throttling
- [ ] Comprehensive test suite
- [ ] API documentation with Swagger
- [ ] Microservices architecture migration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

**Niranjan Kumar**
- GitHub: [@Niranjan05Kumar](https://github.com/Niranjan05Kumar)
- Project: [BackendProject](https://github.com/Niranjan05Kumar/BackendProject)


---

⭐ Star this repository if you found it helpful!

