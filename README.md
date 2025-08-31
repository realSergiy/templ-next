# Next.js Template

A modern, clean Next.js template with TypeScript, Tailwind CSS, and best practices configured out of the box.

## Features

- **Next.js 15**: Latest version with App Router
- **TypeScript**: Full type safety and enhanced developer experience  
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **ESLint & Prettier**: Code linting and formatting configured
- **Modern tooling**: pnpm, strict TypeScript configuration

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone this repository:

```bash
git clone <your-repo-url>
cd nextjs-template
```

2. Install dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
pnpm build
pnpm start
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run TypeScript check and ESLint
- `pnpm fix` - Format with Prettier and fix ESLint issues
- `pnpm clean` - Clean build artifacts

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── components/             # Reusable React components
public/                     # Static assets
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: For type safety and better developer experience  
- **Tailwind CSS**: For styling and responsive design
- **ESLint**: For code linting and consistency
- **Prettier**: For code formatting
- **React**: Frontend library

## Customization

This template is designed to be a starting point. Feel free to:

- Add your preferred state management solution
- Configure additional ESLint rules
- Add testing frameworks
- Integrate with your preferred backend
- Customize Tailwind configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
