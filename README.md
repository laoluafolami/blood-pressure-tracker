# Blood Pressure Tracker

A full-stack web application for tracking and monitoring blood pressure readings.

## Features

- User authentication (register/login)
- Password reset functionality
- Blood pressure tracking (systolic/diastolic)
- Reading history with timestamps
- Data export (CSV, JSON, PDF, Summary)
- Interactive charts and visualization
- Dark/light mode toggle
- Responsive design

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Export**: PDF generation with jsPDF

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Configure environment variables in `.env` file
5. Run the application: `npm start`

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood pressure readings table
CREATE TABLE bp_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    reading_date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);