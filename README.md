# NewsVerifier - AI-Powered News Verification Platform

A professional, elegant platform for verifying the credibility of online content using advanced AI analysis. Detect misinformation, assess trustworthiness, and understand content authenticity in seconds.

## 🎯 Features

### Core Analysis
- **Content Submission**: Analyze URLs or text content
- **AI-Powered Analysis**: LLM-based credibility assessment
- **Credibility Scoring**: 0-100 scale with detailed breakdowns
- **Red Flag Detection**: Identify sensationalism, clickbait, and suspicious patterns
- **Source Assessment**: Evaluate publisher reputation and journalistic standards

### User Features
- **Analysis Dashboard**: View history and statistics
- **Image Verification**: Detect manipulation and deepfakes
- **Save & Bookmark**: Keep important analyses for later
- **Professional UI**: Elegant design with dark/light theme

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- MySQL 8+

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up database
# Create .env.local with DATABASE_URL and other variables
# See QUICK_START.md for details

# 3. Push database schema
pnpm db:push

# 4. Start development server
pnpm dev

# 5. Open http://localhost:3000
```

For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md) or [LOCAL_SETUP.md](./LOCAL_SETUP.md).

## 📊 Project Structure

```
news-verifier/
├── client/                    # React 19 + Vite frontend
│   ├── src/
│   │   ├── pages/            # Page components (Home, Analyze, Results, Dashboard)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   └── index.css         # Global styles (Tailwind + custom)
│   └── index.html
├── server/                    # Express + tRPC backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── analysisEngine.ts     # AI analysis logic
│   └── _core/                # Framework infrastructure
├── drizzle/
│   └── schema.ts             # Database tables (Drizzle ORM)
├── shared/                   # Shared constants
├── QUICK_START.md           # 5-minute setup guide
└── LOCAL_SETUP.md           # Detailed setup guide
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **tRPC** - Type-safe API client
- **Wouter** - Lightweight routing

### Backend
- **Express 4** - Web server
- **tRPC 11** - Type-safe RPC framework
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database

### Testing
- **Vitest** - Unit testing framework

## 📚 Available Commands

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run tests
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm db:push          # Push database schema changes
```

## 🔑 Environment Variables

Create a `.env.local` file with:

```
DATABASE_URL=mysql://user:password@localhost:3306/news_verifier
JWT_SECRET=your-secret-key
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000/auth
OWNER_OPEN_ID=local-owner
OWNER_NAME=Local Developer
BUILT_IN_FORGE_API_URL=http://localhost:3000/api
BUILT_IN_FORGE_API_KEY=local-key
VITE_FRONTEND_FORGE_API_KEY=local-key
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000/api
VITE_ANALYTICS_ENDPOINT=http://localhost:3000/api/analytics
VITE_ANALYTICS_WEBSITE_ID=local
```

## 🎨 Design System

The platform uses an elegant, professional design with:
- **Color Palette**: Warm accent colors (#EF4444), professional grays
- **Typography**: Playfair Display (headings), Inter (body)
- **Theme**: Light mode with optional dark theme support
- **Components**: shadcn/ui for consistent, accessible components

## 📖 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with feature overview |
| Analyze | `/analyze` | Content submission interface |
| Results | `/results/:id` | Analysis results and findings |
| Dashboard | `/dashboard` | User's analysis history and stats |
| Image Verification | `/verify-image/:id` | Image manipulation detection |

## 🔄 API Routes

All API endpoints are under `/api/trpc` using tRPC:

### Analysis Router
- `analysis.submit` - Submit content for analysis
- `analysis.getResult` - Get specific analysis
- `analysis.getHistory` - Get user's analysis history
- `analysis.save` - Save/bookmark analysis
- `analysis.getSaved` - Get saved analyses
- `analysis.analyzeImage` - Analyze image for manipulation
- `analysis.crossReference` - Cross-reference claims

### Dashboard Router
- `dashboard.getAnalysisHistory` - Get recent analyses
- `dashboard.getStatistics` - Get user statistics

### Auth Router
- `auth.me` - Get current user
- `auth.logout` - Sign out user

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

Tests include:
- Analysis engine validation
- Score categorization
- Type safety checks
- Authentication tests

## 🚀 Deployment

The project is ready for deployment to Manus hosting:

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the Management UI
3. Configure custom domain in Settings → Domains

For other hosting platforms, build and deploy:

```bash
pnpm build
pnpm start
```

## 📝 Development Workflow

1. **Backend Changes**: Edit `server/routers.ts` or `server/analysisEngine.ts`
2. **Database Changes**: Update `drizzle/schema.ts`, then run `pnpm db:push`
3. **Frontend Changes**: Edit files in `client/src/pages/` or `client/src/components/`
4. **Styling**: Update `client/src/index.css` for global styles
5. **Tests**: Add tests in `server/*.test.ts`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Issues
- Ensure MySQL is running
- Verify DATABASE_URL format
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Dependencies Issues
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - 5-minute setup
- [Detailed Setup Guide](./LOCAL_SETUP.md) - Complete configuration
- [Template README](./README_TEMPLATE.md) - Framework documentation

## 🤝 Contributing

The codebase follows these conventions:
- **Components**: Use shadcn/ui components from `@/components/ui/*`
- **Styling**: Tailwind CSS with custom CSS variables
- **API**: tRPC procedures with Zod validation
- **Database**: Drizzle ORM with MySQL

## 📄 License

This project is built on the Manus platform.

## 🎓 Learning Resources

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Documentation](https://react.dev/)

---


