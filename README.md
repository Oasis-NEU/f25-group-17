# EmptyNEU

**Find open study spaces at Northeastern University**

**Live at**: [empty-neu.vercel.app](https://empty-neu.vercel.app)

EmptyNEU is a web application that helps Northeastern University students discover available study spaces in real-time. Built with modern web technologies, it provides an intuitive interface for browsing study locations and managing user profiles.

## Features

- **User Authentication**
  - Email/password signup and login
  - Magic link (OAuth passwordless) authentication
  - Email verification support

- **Study Space Discovery**
  - Browse available study spaces across campus
  - Real-time availability updates
  - Search and filter functionality

- **User Profiles**
  - Create and manage student profiles
  - Select major and academic year
  - Add courses to your profile

- **Course Management**
  - View course catalogs by term
  - Add courses to your profile
  - Integrated course data from Northeastern

## Project Structure

```
f25-group-17/
├── FrontEnd/              # Next.js frontend application
│   ├── app/
│   │   ├── login/         # Login page with captcha & magic link
│   │   ├── signup/        # Signup page with form validation
│   │   ├── study/         # Study spaces page
│   │   ├── profile/       # User profile page
│   │   ├── onboarding/    # Course selection onboarding
│   │   ├── api/           # API routes (server-side functions)
│   │   └── components/    # Chakra's prebuilt componenets 
│   │       ├── system.js  # Disable Chakra's preflight
│   ├── components/        # Reusable React components
│   ├── public/            # Static assets
│   └── .env.local         # Environment variables (local)
│
├── supabase/              # Supabase backend configuration
│   ├── config.toml        # Supabase project config
│   └── lib/
│       └── supabase.ts    # Supabase client setup
│
└── Data/                  # Course data scripts & catalogs
    ├── catalogAPI/        # Course catalog parser
    └── [termCode]/        # Term-specific course data
        ├── coursesRaw.json #Only created for fall 2025 and cps 
        ├── courseMeetingTimes.json
        └──data_cleaning.js #Pushes selective data into a postgres database
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: Chakra UI, ShadCN UI, React bits
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase, Supabase, Supabase Auth with Cloudflare Turnstile captcha
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Cloudflare Turnstile account (for captcha)

## Setup Instructions

### 1. Clone & Install

```bash
cd f25-group-17/FrontEnd
npm install
```

### 2. Environment Variables

Create `.env.local` in `FrontEnd/` directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_sitekey

# Allowed Email Domains (comma-separated, optional)
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=gmail.com
```

### 3. Database Setup

Set up your Supabase project with the following tables:

**users** (handled by Supabase Auth)
- id, email, password

**UserData**
- user_id (foreign key to auth.users) (primary key) #UUID
- firstName #Text
- lastName  #Text
- email #Text
- major #Text
- year  #Numeric
- course #JSON

**CourseData**
- id    #UUID
- courseName    #Time
- beginTime #Time
- endTime   #Text
- building  #Text
- roomNumber #Text
- crn   #Numeric
- monday #Bool
- tuesday #Bool
- wednesday #Bool
- thursday #Bool
- friday #Bool

Enable RLS (Row Level Security) on UserData and CourseData table with appropriate policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Sign Up
1. User fills out registration form (name, email, password, major, year)
2. Completes Cloudflare Turnstile captcha, when cloudflare detects non-human activites 
3. Supabase Auth creates account
4. Server-side API (using service role) inserts user profile into UserData table
5. Email verification sent
6. Redirects to login page

### Login
1. User enters email and password
2. Completes captcha verification
3. Supabase Auth authenticates user
4. Redirects to study spaces page

### Magic Link Login
1. User clicks "Login with Email"
2. Enters email address
3. Receives magic link via email
4. Clicks link to verify and sign in
5. Redirects to study spaces page

## Security Features

- **RLS Policies**: Supabase Row Level Security protects user data
- **Service Role API**: Server-side routes bypass RLS safely for profile creation
- **Captcha Protection**: Cloudflare Turnstile prevents bot abuse
- **Input Validation**: Client-side and server-side form validation
- **Email Verification**: Required for new accounts
- **Secure Tokens**: All sensitive data handled server-side

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login` | User login (password + magic link) |
| `/signup` | New user registration |
| `/study` | Browse study spaces |
| `/profile` | View/edit user profile |
| `/onboarding/courses` | Add courses to profile |
| `/about` | About page |

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/userdata` | POST | Create user profile (server-side, service role) |
| `/api/userdata` | GET | Check if user profile exists |

## 📊 Course Data

Course data is fetched from Northeastern's catalog API and stored in JSON format by term:

- **Format**: `[termCode]/coursesRaw.json`, `[termCode]/courseMeetingTimes.json`
- **Terms**: 202610 (Fall), 202615 (Spring), 202625 (Summer), 202630 (Co-op)
- **Parser**: `Data/catalogAPI/src/courseParser.js`

## UI Features

- **Dark Theme**: Red and gray gradient design
- **Responsive Design**: Mobile-friendly layout
- **Animations**: Smooth transitions and hover effects
- **Form Validation**: Real-time error feedback
- **Loading States**: Disabled buttons during API calls
- **Dropdown Menus**: Searchable major and year selectors

## Testing

Test the application flow:

1. **Sign Up**: Create new account with test credentials
2. **Verify Email**: Check email for verification link (or use Supabase dashboard)
3. **Login**: Sign in with email/password
4. **Magic Link**: Test passwordless login
5. **Failed Retry**: Verify captcha resets on failed login attempt
6. **Profile**: View and update user profile

## Known Issues & Fixes

- **Captcha appears twice on page navigation**: Fixed by adding cleanup in useEffect
- **Failed login prevents retry**: Fixed by resetting captcha token on error
- **Hydration warnings**: Suppressed on captcha container
- **RLS blocks profile insertion**: Solved using server-side API with service role

## Dependencies

Key packages:

```json
{
  "next": "^15.x",
  "react": "^19.x",
  "@chakra-ui/react": "^2.x",
  "@supabase/supabase-js": "^2.x",
  "tailwindcss": "^3.x",
  "typescript": "^5.x"
}
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
npm run build
npm start
```

## Development Guidelines

- Use TypeScript for type safety
- Follow React best practices (hooks, composition)
- Keep API routes in `/app/api/`
- Use Tailwind for styling
- Test authentication flows before deploying

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## Support

For issues or questions, please create an issue in the repository or contact the development team.

## License

This project is part of the Northeastern University Oasis Fall 2025 cohort, Group 17.

---

**🥴 Built with love 😛😛😛 for Northeastern Students 😍 by Northeastern Students 😍 🥴**
