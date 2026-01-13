# Mini Drive Frontend

React frontend for the Mini Drive file sharing application.

## Setup

```bash
npm install
npm start
```

Frontend runs on `http://localhost:3000`

Make sure backend is running on `http://localhost:5000`

## Features

- User signup/login
- File upload (drag & drop or file picker)
- View uploaded files
- Download files
- Delete files
- Share files with access requests
- Admin dashboard to view all files
- Admin can delete any file

## Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

For production (Vercel):
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## Deployment to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy!
