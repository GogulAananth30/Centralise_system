# Smart Student Hub

## Setup and Running

### 1. Backend Setup

The backend is built with FastAPI and uses SQLite (default) and MongoDB.

**Prerequisites:**
- Python 3.8+
- MongoDB (optional, for some features)

**Steps:**
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

The frontend is built with Next.js.

**Prerequisites:**
- Node.js 18+

**Steps:**
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Notes
- The default database is SQLite, which works out of the box.
- MongoDB is configured at `mongodb://localhost:27017`. Ensure it's running if you use features requiring it.
