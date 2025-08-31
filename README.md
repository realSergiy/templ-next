# TotVibe Uploader

A simple Next.js TypeScript application that allows users to upload files using drag and drop
functionality. Files are automatically saved to the `/data` folder.

## Features

- **Drag & Drop Interface**: Simply drag files onto the upload area
- **Multiple File Support**: Upload multiple files at once
- **Real-time Feedback**: Visual feedback during drag operations and upload progress
- **File Information Display**: Shows uploaded files with details (filename, size, type, upload
  time)
- **TypeScript**: Fully typed for better development experience
- **Tailwind CSS**: Modern, responsive styling

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal) with your
browser to see the application.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts          # API endpoint for file uploads
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main page component
├── components/
│   └── FileUploader.tsx         # Drag & drop file uploader component
data/                            # Directory where uploaded files are stored
```

## How It Works

1. **Frontend**: The `FileUploader` component provides a drag-and-drop interface built with React
   hooks and Tailwind CSS
2. **API**: The `/api/upload` endpoint handles file uploads using Next.js App Router API routes
3. **File Storage**: Files are saved to the `/data` directory with timestamp prefixes to avoid
   naming conflicts
4. **TypeScript**: The entire application is written in TypeScript for better type safety and
   development experience

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling and responsive design
- **Biome**: For code formatting and linting
- **React**: Frontend library
- **Node.js**: Runtime environment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
