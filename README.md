# The Social Scoop

A full-stack social media app: create posts with images/videos, like and comment,
follow people (with follow-request approval), real-time direct messaging, profiles,
search, and light/dark themes.

- **Frontend:** React 18, Redux Toolkit (redux-persist), React Router, styled-components, Socket.io client
- **Backend:** Node.js, Express, Socket.io, NeDB (file-based embedded database), JWT auth, multer file uploads

> The frontend lives in `TheSocialScoop-master/TheSocialScoop-master/`.
> The backend lives in `backend/`.

---

## Quick start (local)

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # optional — sensible defaults are built in
node server.js              # starts on http://localhost:5000
```

### 2. Frontend (in a second terminal)

```bash
cd TheSocialScoop-master/TheSocialScoop-master
npm install
npm start                  # starts on http://localhost:3000
```

Open **http://localhost:3000**, create an account, and start posting.

### Or start both at once

From the repo root:

```bash
bash start.sh
```

---

## How it works

- Data is stored in `backend/data/*.db` (NeDB — no database server to install).
- Uploaded images/videos are saved to `backend/uploads/` and served from `/uploads/...`.
- On login/signup the backend issues a **JWT**; the frontend stores it (via redux-persist)
  and automatically attaches it to API requests. Write endpoints (posting, liking,
  commenting, following, messaging, profile edits, uploads) require a valid token.
- Real-time messaging runs over Socket.io.

### Configuration

**Backend** (`backend/.env`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Port to listen on |
| `JWT_SECRET` | dev fallback | Secret for signing tokens — **set this in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `PUBLIC_URL` | auto | Base URL used to build local uploaded-file links |
| `CLOUDINARY_URL` | – | If set, uploads go to Cloudinary instead of local disk (durable) |

**Frontend** (`TheSocialScoop-master/TheSocialScoop-master/.env`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://localhost:5000/api/` | Backend API base URL (trailing slash) |
| `REACT_APP_SOCKET_URL` | `http://localhost:5000` | Socket.io URL (empty = same origin) |

---

## Deployment

### One service on Render (recommended)

This repo includes a [`render.yaml`](./render.yaml) blueprint. In production the Express
server also serves the built React app, so there is a single URL and no CORS to configure.

1. Push this repo to GitHub.
2. On [Render](https://render.com), choose **New → Blueprint** and pick this repo.
3. Render reads `render.yaml`, installs the backend, and starts it serving both the API
   and the (already-built) React app.
4. A strong `JWT_SECRET` is generated automatically.

> **Why the build is committed:** Render's free tier gives a build only 512 MB of RAM,
> but a Create React App production build peaks near 1 GB and gets OOM-killed (the deploy
> fails with `Killed` / exit 137). To avoid that, the frontend is **pre-built and committed**
> (`TheSocialScoop-master/.../build`), so the free tier only runs the lightweight backend.
> The bundle is baked with `REACT_APP_API_URL=/api/` and an empty `REACT_APP_SOCKET_URL`
> (same origin), so it is portable to any host.
>
> **Changing the UI:** rebuild and commit the bundle with `./rebuild-frontend.sh`. (On a
> paid plan with ≥2 GB build RAM you could instead let Render build it — set `buildCommand`
> back to `cd backend && npm install && cd ../TheSocialScoop-master/TheSocialScoop-master && npm install && REACT_APP_API_URL=/api/ REACT_APP_SOCKET_URL= npm run build`.)

> **Durable uploads:** the free tier filesystem is ephemeral, so locally-stored media is lost on
> restart. Set `CLOUDINARY_URL` (free [Cloudinary](https://cloudinary.com) account) in the Render
> dashboard and uploads automatically go there instead — no code change needed. Without it, uploads
> fall back to the local `./uploads` folder, which is fine for local development.

### Two services (alternative)

You can also deploy the backend and frontend separately (e.g. backend on Render/Railway,
frontend on Netlify/Vercel). Set the frontend's `REACT_APP_API_URL` to
`https://<your-backend-host>/api/` and `REACT_APP_SOCKET_URL` to `https://<your-backend-host>`.

---

## API overview

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | – | Create account, returns user + JWT |
| POST | `/api/auth/login` | – | Log in, returns user + JWT |
| GET | `/api/users/user/:username` | – | Get a user profile |
| GET | `/api/users/:query` | – | Search users |
| GET | `/api/users/followers/:username` | – | List followers |
| GET | `/api/users/friends/:username` | – | List following |
| POST | `/api/users/users-details` | – | Resolve a list of user IDs |
| PUT | `/api/users/theme/:userId` | ✓ | Update theme preference |
| PUT | `/api/users/follow-request/:id` | ✓ | Send follow request |
| PUT | `/api/users/approve-follow-request/:id` | ✓ | Approve request |
| PUT | `/api/users/reject-follow-request/:id` | ✓ | Reject request |
| PUT | `/api/users/unsend-follow-request/:id` | ✓ | Cancel sent request |
| PUT | `/api/users/unfollow/:id` | ✓ | Unfollow |
| PUT | `/api/users/:id` | ✓ | Update profile |
| DELETE | `/api/users/:id` | ✓ | Delete account |
| GET | `/api/posts/:userId` | – | Feed (own + followed users) |
| GET | `/api/posts/profile/:userId` | – | A user's own posts |
| POST | `/api/posts/create-post` | ✓ | Create a post |
| PUT | `/api/posts/reactions/:postId` | ✓ | Like / unlike |
| PUT | `/api/posts/comment/:postId` | ✓ | Add a comment |
| PUT | `/api/posts/delete-comment/:postId` | ✓ | Delete a comment |
| DELETE | `/api/posts/delete-post/:postId` | ✓ | Delete a post |
| GET | `/api/conversations/:userId` | – | List conversations |
| POST | `/api/conversations` | ✓ | Start a conversation |
| GET | `/api/message/:conversationId` | – | Get messages |
| POST | `/api/message` | ✓ | Send a message |
| POST | `/api/upload` | ✓ | Upload a file, returns its URL |
