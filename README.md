# janseva-digital-platform
JANSEVA - Digital Public Service Platform for India | React PWA + Node.js + PostgreSQL | JWT Auth | Offline-First | Government-grade Security

## 🇮🇳 About JANSEVA (जनसेवा)

JANSEVA is a comprehensive digital platform designed to streamline government services for Indian citizens. Built with a focus on rural India, it provides offline-first capabilities to work even in areas with intermittent connectivity.

### ✨ Key Features

- 🌐 **Bilingual Support** - English & Marathi (जनसेवा)
- 📱 **Progressive Web App (PWA)** - Installable, works offline
- 👥 **Multi-Role System** - Citizen, Officer, and Admin portals
- 🔒 **Secure Authentication** - JWT-based auth with mobile OTP
- 📊 **Real-time Tracking** - Track application status with visual indicators
- 🏛️ **Government Services**:
  - Birth Certificate / जन्म प्रमाणपत्र
  - Death Certificate / मृत्यु प्रमाणपत्र
  - Income Certificate / उत्पन्न प्रमाणपत्र
  - Caste Certificate / जात प्रमाणपत्र
  - Domicile Certificate / अधिवास प्रमाणपत्र
  - Ration Card / रेशन कार्ड
  - Property Tax / मालमत्ता कर
  - Water Connection / पाणी जोडणी

## 🏗️ Tech Stack

### Frontend
- ⚛️ **React 18** with Vite
- 🎨 **Tailwind CSS** for styling
- 🔄 **Zustand** for state management
- 📡 **Axios** for API calls
- 🚀 **PWA** with Service Worker

### Backend
- 🟢 **Node.js** with Express
- 🐘 **PostgreSQL** database
- 🔐 **JWT** authentication
- 🔒 **bcryptjs** for password hashing
- ⚡ **dotenv** for environment variables

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mohan-2006/janseva-digital-platform.git
cd janseva-digital-platform
```

### 2️⃣ Setup Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE janseva_db;

# Connect to the database
\c janseva_db

# Run the schema file
\i database/schema.sql

# Exit PostgreSQL
\q
```

### 3️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env` file:**

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/janseva_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

```bash
# Start backend server
npm run dev
```

✅ Backend will run at: **http://localhost:5000**

### 4️⃣ Setup Frontend

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `frontend/.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend development server
npm run dev
```

✅ Frontend will run at: **http://localhost:5173**

## 🎯 Using the Application

### First Time Setup

1. Open browser and navigate to **http://localhost:5173**
2. Click **Register** to create a new account
3. Fill in your details:
   - Full Name
   - Mobile Number (10 digits)
   - Email (optional)
   - Password
   - Select Role: **Citizen**, **Officer**, or **Admin**
   - If Officer: Select your district
4. Click **Register**
5. Login with your credentials

### For Citizens (नागरिक)

1. **Dashboard** - View your application statistics
2. **Apply for Service** - Submit new applications
3. **Track Status** - Check application progress with ID
4. **View Applications** - See all your submitted applications

### For Officers (अधिकारी)

1. **Dashboard** - View all applications for your district
2. **Filter Applications** - By status (submitted, under review, approved, rejected)
3. **Review Applications** - Click "Review" to see details
4. **Take Action**:
   - Mark as "Under Review"
   - Approve with remarks
   - Reject with reason

### For Admins (प्रशासक)

1. **System Dashboard** - View overall statistics
2. **User Management** - Activate/deactivate users
3. **Application Overview** - Monitor all applications
4. **Reports** - Access system-wide data

## 📱 Testing Offline Mode

1. Open **Chrome DevTools** (Press F12)
2. Go to **Network** tab
3. Change throttling dropdown to **Offline**
4. Navigate through the app - it still works!
5. Fill forms offline - data will sync when back online

## 📁 Project Structure

```
janseva-digital-platform/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── citizen/     # Citizen portal
│   │   │   ├── officer/     # Officer portal
│   │   │   └── admin/       # Admin portal
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── package.json
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Database config
│   │   ├── utils/           # Utility functions
│   │   ├── app.js           # Express app
│   │   └── server.js        # Server entry point
│   └── package.json
│
├── database/                # Database files
│   └── schema.sql           # PostgreSQL schema
│
├── .env.example             # Environment variables template
├── .gitignore
└── README.md
```

## 🔧 Available Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Citizen
- `POST /api/citizen/applications` - Create application
- `GET /api/citizen/applications/:id` - Get application by ID
- `GET /api/citizen/applications` - Get user applications

### Officer
- `GET /api/officer/applications` - Get district applications
- `PUT /api/officer/applications/:id` - Update application status

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `GET /api/admin/applications/recent` - Get recent applications

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS enabled

## 🌍 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Upload dist/ folder to hosting service
```

### Backend (Railway/Render/Heroku)

```bash
cd backend
# Set environment variables on hosting platform
# Deploy using Git or Docker
```

### Database (Supabase/Neon/Railway)

- Create PostgreSQL database
- Run `database/schema.sql`
- Update `DATABASE_URL` in backend `.env`

## 📸 Screenshots

### Citizen Portal
- Dashboard with application stats and offline indicator
- Bilingual application form (English/Marathi)
- Real-time application tracking

### Officer Portal
- Application review dashboard
- Filtering by status
- Approval/rejection workflow

### Admin Portal
- System-wide statistics
- User management
- Recent applications overview

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Mohan-2006**
- GitHub: [@Mohan-2006](https://github.com/Mohan-2006)
- Location: Vasind, Maharashtra, India

## 🙏 Acknowledgments

- Built for improving government service delivery in India
- Designed with rural connectivity challenges in mind
- Inspired by Digital India initiatives

## 📞 Support

For support, please open an issue on GitHub or contact the maintainer.

---

**Made with ❤️ for Digital India 🇮🇳**

**जय हिंद! | Jai Hind!**
