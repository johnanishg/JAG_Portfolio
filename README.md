# JAG Portfolio

A modern, interactive portfolio website built with React, TypeScript, and Tailwind CSS. Features smooth scroll-based navigation, animated transitions, and a beautiful UI inspired by modern design principles.

## 🌟 Features

- **Smooth Scroll Navigation**: Intuitive scroll-based section navigation with smooth transitions
- **Animated Sections**: Beautiful entrance animations and section transitions
- **Responsive Design**: Fully responsive layout that works on all devices
- **Interactive UI**: Modern gradient designs and hover effects
- **Multi-Section Portfolio**: 
  - Home/Introduction
  - About Me
  - Experience
  - Projects
  - Skills
  - Contact

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Supabase** - Backend services (for contact form/data storage)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JAG_Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (if using Supabase)
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run typecheck` - Run TypeScript type checking

## 📁 Project Structure

```
JAG_Portfolio/
├── public/                 # Static assets
│   └── WhatsApp Image...   # Portfolio images
├── src/
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # Vite type definitions
├── index.html             # HTML template
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 Customization

- **Colors**: Modify the gradient colors in `App.tsx` and Tailwind classes
- **Sections**: Update section content in `App.tsx` under each section component
- **Styling**: Adjust Tailwind utility classes or modify `tailwind.config.js`
- **Animations**: Customize animation timings and styles in the `getAnimationStyle` function

## 🚢 Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory, ready for deployment to any static hosting service.

## 📝 License

This project is private and personal.

## 👤 Author

JAG (John A. G.)

---

Built with ❤️ using React and TypeScript
