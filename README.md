# MacBook Device API Service

A RESTful API service that provides comprehensive information about MacBook models from 2010-2025, including support status, specifications, and compatibility details.

## 🚀 Quick Start with GitHub Codespaces

1. **Create a new repository** on GitHub with these files
2. **Open in Codespaces** - Click the green "Code" button and select "Create codespace on main"
3. **Wait for setup** - The codespace will automatically install dependencies
4. **Start the server**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
5. **Access the API** - The service will be available on port 3000

## 📁 Project Structure

```
macbook-api/
├── .devcontainer/
│   └── devcontainer.json
├── data/
│   └── macbook_models_2010_2025.json
├── server.js
├── package.json
├── README.md
└── tests/ (optional)
```

## 🔧 Setup Instructions

### For GitHub Codespaces:
1. Ensure your repository has the `.devcontainer/devcontainer.json` file
2. Place your JSON data file in the `data/` directory
3. Open the repository in GitHub Codespaces
4. Run `npm start`

### For Local Development:
```bash
# Clone the repository
git clone <your-repo-url>
cd macbook-api

# Install dependencies
npm install

# Create data directory and add JSON file
mkdir data
# Copy your macbook_models_2010_2025.json to data/

# Start the server
npm start
```

## 📖 API Documentation

### Base URL
- **Codespaces**: `https://your-codespace-url.github.dev`
- **Local**: `http://localhost:3000`

### Endpoints

#### Health Check
- **GET** `/health`
- Returns service health status

#### Get All Devices
- **GET** `/api/devices`
- **Query Parameters**:
  - `status` - Filter by support status (`supported`, `vintage`, `obsolete`)
  - `search` - Search in model name, ID, or status
  - `sort_by` - Sort by field (`release_date`, `model_name`, `supported_end_date`)
  - `order` - Sort order (`asc`, `desc`) - default: `desc`
  - `type` - Filter by device type (`air`, `pro`)

#### Get MacBook Air Models
- **GET** `/api/devices/macbook-air`
- Same query parameters as above

#### Get MacBook Pro Models  
- **GET** `/api/devices/macbook-pro`
- Same query parameters as above

#### Get Specific Device
- **GET** `/api/devices/:modelId`
- Returns device by model ID (e.g., `MacBookAir10,1`)

#### Get Support Status Definitions
- **GET** `/api/support-status`
- Returns definitions for support status categories

#### API Documentation
- **GET** `/api/docs`
- Returns complete API documentation

### Example Requests

```bash
# Get all supported devices
curl "https://your-codespace-url.github.dev/api/devices?status=supported"

# Search for M1 models
curl "https://your-codespace-url.github.dev/api/devices?search=M1"

# Get MacBook Air models sorted by name
curl "https://your-codespace-url.github.dev/api/devices/macbook-air?sort_by=model_name&order=asc"

# Get specific device
curl "https://your-codespace-url.github.dev/api/devices/MacBookAir10,1"
```

### Response Format

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "model_name": "MacBook Air (M1, 2020)",
      "model_id": "MacBookAir10,1",
      "release_date": "2020-11-17",
      "support_status": "supported",
      "supported_end_date": "2027-11-17",
      "latest_macos_supported": "macOS Sequoia 15.5"
    }
  ],
  "metadata": {
    "support_status_definitions": {...},
    "notes": {...}
  }
}
```

## 🛠️ Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (when implemented)

### Adding Features
The API is built with Express.js and includes:
- CORS support for cross-origin requests
- Security headers with Helmet
- Request logging with Morgan
- Comprehensive error handling
- Flexible filtering and sorting

### Environment Variables
- `PORT` - Server port (default: 3000)

## 🔍 Device Data Fields

Each device includes:
- `model_name` - Full model name
- `model_id` - Apple's internal model identifier  
- `release_date` - When the model was released
- `support_status` - Current support level (supported/vintage/obsolete)
- `supported_end_date` - Estimated end of support
- `latest_macos_supported` - Highest compatible macOS version

## 📝 Usage Examples for IT Management

### Check Device Support Status
```javascript
// Check if a device is still supported
fetch('/api/devices/MacBookAir8,1')
  .then(response => response.json())
  .then(data => {
    console.log(`Status: ${data.data.support_status}`);
    console.log(`Support ends: ${data.data.supported_end_date}`);
  });
```

### Get Devices Due for Replacement
```javascript
// Find vintage/obsolete devices
fetch('/api/devices?status=vintage')
  .then(response => response.json())
  .then(data => {
    console.log(`${data.count} devices need attention`);
  });
```

### Generate Compatibility Reports
```javascript
// Get all devices and their macOS compatibility
fetch('/api/devices?sort_by=supported_end_date&order=asc')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(device => {
      console.log(`${device.model_name}: ${device.latest_macos_supported}`);
    });
  });
```

## 🚨 Troubleshooting

### Common Issues:
1. **Port 3000 in use**: Change the PORT environment variable
2. **JSON file not found**: Ensure the data file is in the `data/` directory
3. **Codespace port forwarding**: Check the Ports tab in VS Code

### Support:
For questions or issues, check the `/api/docs` endpoint for the most current API documentation.

## 📄 License

MIT License - Feel free to use this for your organization's IT management needs!
