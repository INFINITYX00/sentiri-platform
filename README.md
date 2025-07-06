# Sentiri - Sustainable Manufacturing Dashboard

A comprehensive manufacturing dashboard for tracking materials, carbon footprint, and production processes with sustainability focus.

## Features

- **Material Management**: Track inventory, carbon footprints, and material passports
- **Project Management**: Manage manufacturing projects and BOMs
- **Carbon Tracking**: Monitor and reduce environmental impact
- **Production Planning**: Streamline manufacturing processes
- **Real-time Analytics**: Dashboard with key metrics and insights

## Technologies Used

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context, React Query
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd sentiri-platform

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

1. Create a Supabase project
2. Set up your database tables and RLS policies
3. Configure environment variables for Supabase connection

## Development

- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Deployment

This project can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
