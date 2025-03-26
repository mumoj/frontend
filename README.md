# Trip Planner & ELD Logger Frontend

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A React-based frontend for the Trip Planner & ELD Logger application. The app enables optimal routing of carrier trucks while generating electronic logging device (ELD) logs that comply with Hours of Service regulations.

## 🚚 Features

- **Interactive Trip Planning**: Plan routes between multiple locations with intelligent routing
- **ELD Log Generation**: Automatically generate compliant electronic logging device logs
- **Interactive Maps**: Visualize routes with stop details using Leaflet maps
- **Location Management**: Add and manage locations with map-based picker
- **Responsive Design**: Works on desktop and mobile devices

## 🖥️ Tech Stack

- **React 18** with TypeScript
- **React Bootstrap** for UI components
- **Leaflet/React-Leaflet** for interactive maps
- **TailwindCSS** for responsive styling
- **Axios** for API requests

## 🏗️ Project Structure

```
src/
├── assets/            # Static assets like images
├── components/        # React components
│   ├── AddLocation.tsx         # Add new locations
│   ├── ELDLogGenerator.tsx     # Canvas-based ELD log generation
│   ├── Header.tsx              # App header with hero section
│   ├── LocationMapPicker.tsx   # Map-based location picker
│   ├── LocationSelector.tsx    # Location selection interface
│   ├── LogDownload.tsx         # Log download/print functionality
│   ├── LogViewer.tsx           # Daily logs display
│   ├── NavBar.tsx              # Navigation bar
│   ├── ResultsSection.tsx      # Trip results container
│   ├── RouteMap.tsx            # Route visualization
│   ├── StopsList.tsx           # List of route stops
│   ├── TripForm.tsx            # Main trip planning form
│   └── TripSummary.tsx         # Trip summary display
├── services/          # API and service functions
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
├── App.css            # Application styles
└── index.tsx          # Application entry point
```

## 📝 Key Components

### Trip Form
The main form for inputting trip details including:
- Current location
- Pickup location
- Dropoff location
- Current cycle hours used
- Client timezone

### Results Section
Displays computed route information:
- Route stops list
- Trip summary (distance, duration, etc.)
- Interactive map visualization
- Daily log viewer with downloadable ELD logs

### ELD Log Generator
Client-side generation of compliant ELD logs including:
- Canvas-based visualization
- Status tracking (driving, on-duty, off-duty, sleeper berth)
- Download and print functionality

### LocationMapPicker
Interactive map for selecting locations:
- Uses OpenStreetMap
- Reverse geocoding for address lookup
- Coordinate selection

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourname/trip-planner-frontend.git
cd trip-planner-frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:8000
```

4. Start the development server
```bash
npm start
```

The application will be available at http://localhost:3000

## 🔌 API Integration

The frontend communicates with the backend API for:
- Location management
- Trip planning and route calculation
- ELD log storage and retrieval

See the backend README for API details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Jackson Mumo - [mumo@example.com](mailto:mumo@example.com)

Project Link: [https://github.com/mumojs/trip-planner-frontend](https://github.com/mumojs/trip-planner-frontend)
