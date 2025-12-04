# Hospital EMR System - Frontend

React.js frontend application for the Hospital EMR System with Tailwind CSS.

## Features

- 🔐 **Authentication**: JWT-based login with session management
- 👥 **Patient Management**: Complete CRUD operations for patients
- 🏥 **Clinical Encounters**: Create and manage medical encounters
- 📅 **Appointment Scheduling**: Book and manage appointments
- 📊 **Dashboard**: Overview of key metrics and recent activities
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- ⚡ **Fast**: Built with Vite for lightning-fast development

## Tech Stack

- **Framework**: React 18.2
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Build Tool**: Vite

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8080

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Hospital EMR System
VITE_APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── layouts/            # Layout components
│   │   ├── MainLayout.jsx  # Main app layout with sidebar
│   │   └── AuthLayout.jsx  # Authentication layout
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── patients/       # Patient management pages
│   │   ├── encounters/     # Encounter pages
│   │   ├── appointments/   # Appointment pages
│   │   ├── DashboardPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/           # API service functions
│   │   ├── api.js          # Axios instance
│   │   ├── patientService.js
│   │   ├── encounterService.js
│   │   └── appointmentService.js
│   ├── stores/             # Zustand state stores
│   │   └── authStore.js    # Authentication state
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Lint code with ESLint
npm run format           # Format code with Prettier
```

## Features Implementation

### Authentication

- Login with email/password
- JWT token management
- Automatic token refresh
- Protected routes
- Persistent authentication state

### Patient Management

- List all patients with pagination
- Search patients by name, MRN, or email
- View patient details and timeline
- Create new patients
- View allergies, medications, encounters
- View appointments

### Encounters

- List all encounters with filters
- View encounter details
- Create new encounters
- Add clinical notes (SOAP)
- Record diagnoses (ICD-10)
- Record vital signs

### Appointments

- List appointments with filters
- View appointment details
- Create new appointments
- Check provider availability
- Cancel appointments
- Check-in functionality

### Dashboard

- Statistics overview
- Recent patients
- Today's appointments
- Quick actions

## API Integration

The frontend communicates with the backend API using Axios. All API calls include:

- JWT token in Authorization header
- Automatic token refresh on 401 errors
- Error handling and user notifications
- Request/response interceptors

### API Service Example

```javascript
import api from './api'

export const patientService = {
  getPatients: async (page = 1, pageSize = 20, search = '') => {
    const response = await api.get('/patients', {
      params: { page, page_size: pageSize, search }
    })
    return response.data
  },
  
  getPatient: async (id) => {
    const response = await api.get(`/patients/${id}`)
    return response.data
  },
  
  // ... other methods
}
```

## State Management

Using Zustand for lightweight state management:

```javascript
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // Login logic
      },
      
      logout: async () => {
        // Logout logic
      },
    }),
    { name: 'auth-storage' }
  )
)
```

## Styling

Tailwind CSS utility classes with custom components:

```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6;
}
```

## Responsive Design

- Mobile-first approach
- Responsive sidebar (mobile drawer)
- Responsive tables
- Breakpoints: sm, md, lg, xl

## Demo Credentials

After seeding the backend database:

- **Admin**: `admin@hospital-emr.com` / `admin123`
- **Doctor**: `doctor@hospital-emr.com` / `doctor123`

## Development Tips

1. **Hot Reload**: Changes are reflected immediately
2. **API Proxy**: Vite proxies `/api` requests to backend
3. **State Inspection**: Use Zustand DevTools for debugging
4. **Component Dev**: Use React DevTools extension

## Building for Production

```bash
# Build optimized production bundle
npm run build

# The build will be in the `dist` directory
# Serve with any static file server
```

## Deployment

### Static Hosting (Netlify, Vercel)

```bash
# Build
npm run build

# Deploy dist folder
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### API Connection Issues

1. Check if backend is running on port 8080
2. Verify VITE_API_BASE_URL in .env
3. Check browser console for CORS errors

### Build Errors

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node.js version: `node --version` (18+)

### Authentication Issues

1. Check if JWT token is stored in localStorage
2. Verify token expiration
3. Check backend /auth/verify endpoint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting by route
- Lazy loading for pages
- Optimized bundle size
- Fast refresh during development

## Contributing

1. Follow the component structure
2. Use TypeScript types (if migrating)
3. Write reusable components
4. Follow Tailwind CSS conventions
5. Add PropTypes for components

## License

Proprietary - Hospital EMR System

## Support

- Email: support@hospital-emr.com
- Documentation: https://docs.hospital-emr.com

---

**Happy Coding!** 🚀
