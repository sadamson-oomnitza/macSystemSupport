const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Load MacBook data
let macbookData;
try {
  const dataPath = path.join(__dirname, 'data', 'macbook_models_2010_2025.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  macbookData = JSON.parse(rawData);
} catch (error) {
  console.error('Error loading MacBook data:', error);
  process.exit(1);
}

// Helper functions
const filterByStatus = (devices, status) => {
  return devices.filter(device => device.support_status === status);
};

const searchDevices = (devices, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return devices.filter(device => 
    device.model_name.toLowerCase().includes(term) ||
    device.model_id.toLowerCase().includes(term) ||
    device.support_status.toLowerCase().includes(term)
  );
};

const sortDevices = (devices, sortBy = 'release_date', order = 'desc') => {
  return [...devices].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'release_date' || sortBy === 'supported_end_date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all devices
app.get('/api/devices', (req, res) => {
  try {
    const { status, search, sort_by, order, type } = req.query;
    
    let allDevices = [
      ...macbookData.macbook_models.macbook_air,
      ...macbookData.macbook_models.macbook_pro
    ];

    // Filter by device type
    if (type) {
      if (type.toLowerCase() === 'air') {
        allDevices = macbookData.macbook_models.macbook_air;
      } else if (type.toLowerCase() === 'pro') {
        allDevices = macbookData.macbook_models.macbook_pro;
      }
    }

    // Filter by support status
    if (status) {
      allDevices = filterByStatus(allDevices, status);
    }

    // Search functionality
    if (search) {
      allDevices = searchDevices(allDevices, search);
    }

    // Sort devices
    if (sort_by) {
      allDevices = sortDevices(allDevices, sort_by, order);
    }

    res.json({
      success: true,
      count: allDevices.length,
      data: allDevices,
      metadata: {
        support_status_definitions: macbookData.support_status_definitions,
        notes: macbookData.notes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get MacBook Air models only
app.get('/api/devices/macbook-air', (req, res) => {
  try {
    const { status, search, sort_by, order } = req.query;
    let devices = [...macbookData.macbook_models.macbook_air];

    if (status) devices = filterByStatus(devices, status);
    if (search) devices = searchDevices(devices, search);
    if (sort_by) devices = sortDevices(devices, sort_by, order);

    res.json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get MacBook Pro models only
app.get('/api/devices/macbook-pro', (req, res) => {
  try {
    const { status, search, sort_by, order } = req.query;
    let devices = [...macbookData.macbook_models.macbook_pro];

    if (status) devices = filterByStatus(devices, status);
    if (search) devices = searchDevices(devices, search);
    if (sort_by) devices = sortDevices(devices, sort_by, order);

    res.json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get device by model ID
app.get('/api/devices/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const allDevices = [
      ...macbookData.macbook_models.macbook_air,
      ...macbookData.macbook_models.macbook_pro
    ];

    const device = allDevices.find(d => d.model_id === modelId);

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
        message: `No device found with model ID: ${modelId}`
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get support status definitions
app.get('/api/support-status', (req, res) => {
  res.json({
    success: true,
    data: macbookData.support_status_definitions
  });
});

// Get API documentation
app.get('/api/docs', (req, res) => {
  const documentation = {
    title: "MacBook Device API Documentation",
    version: "1.0.0",
    base_url: `http://localhost:${PORT}`,
    endpoints: {
      "GET /health": "Health check endpoint",
      "GET /api/devices": {
        description: "Get all MacBook devices",
        query_parameters: {
          status: "Filter by support status (supported, vintage, obsolete)",
          search: "Search in model name, model ID, or support status",
          sort_by: "Sort by field (release_date, model_name, supported_end_date)",
          order: "Sort order (asc, desc) - default: desc",
          type: "Filter by device type (air, pro)"
        }
      },
      "GET /api/devices/macbook-air": "Get MacBook Air models only",
      "GET /api/devices/macbook-pro": "Get MacBook Pro models only",
      "GET /api/devices/:modelId": "Get specific device by model ID",
      "GET /api/support-status": "Get support status definitions"
    },
    examples: {
      "All supported devices": "/api/devices?status=supported",
      "Search for M1 models": "/api/devices?search=M1",
      "MacBook Air sorted by name": "/api/devices/macbook-air?sort_by=model_name&order=asc",
      "Specific device": "/api/devices/MacBookAir10,1"
    }
  };

  res.json(documentation);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MacBook Device API Service',
    version: '1.0.0',
    documentation: `/api/docs`,
    endpoints: {
      devices: '/api/devices',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist. Visit /api/docs for available endpoints.`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MacBook API Service running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔍 All devices: http://localhost:${PORT}/api/devices`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
