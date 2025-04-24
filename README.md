# TrendFinderAgent

An intelligent trend analysis application that discovers and analyzes trending topics, generates content ideas, and creates scripts with audio output.

## Project Structure

- **Backend**: AI-powered services for trend analysis and content generation
- **TrendAppGUI**: Electron-based graphical user interface

## Features

- Trend discovery and analysis
- Content idea generation
- Script writing automation
- Audio generation from scripts
- User-friendly Electron interface

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/TrendFinderAgent.git
cd TrendFinderAgent
```

2. Install dependencies for the backend
```bash
cd backend
npm install
```

3. Install dependencies for the frontend
```bash
cd ../TrendAppGUI
npm install
```

4. Create a `.env` file in the TrendAppGUI directory (see `.env.example` for required variables)

## Usage

### Backend Services

The backend provides several services:

- `findTrends.js`: Discovers current trending topics
- `generateIdeas.js`: Creates content ideas based on trends
- `writeScript.js`: Generates scripts from content ideas
- `generateAudio.js`: Converts scripts to audio
- `extractContent.js`: Extracts relevant content from articles

### Frontend Application

Start the Electron application:

```bash
cd TrendAppGUI
npm start
```

## Model Context Protocol (MCP) Integration

This application includes MCP server integration for enhanced AI model context management. The MCP server facilitates efficient communication between the application and AI models.

## API Keys Required

- NEWS API Key (for trend discovery)
- GROQ API Key (for AI text generation)
- OpenAI API Key (for advanced AI features)

See `.env.example` for configuration.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
