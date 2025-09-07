const TaxiCity = require('../models/TaxiCity');
const path = require('path');
const fs = require('fs');

// Helper function to capitalize city name
function capitalizeCityName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Helper function to generate slug
function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to generate short slug
function generateShortSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
}

// Helper function to generate full slug for taxi cities
function generateTaxiFullSlug(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `taxi-service-in-${cleanName}`;
}

// Helper function to create taxi city page component
function createTaxiCityPageComponent(cityName, slug) {
  const componentTemplate = `import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, Container, Grid, Card, CardContent, Button, Chip, Alert } from '@mui/material';
import { FaTaxi, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import TaxiNavBar from '../../components/taxi-components/TaxiNavBar';
import api from '../../utils/api';

const ${cityName}TaxiPage = () => {
  const [taxiServices, setTaxiServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaxiServices();
  }, []);

  const fetchTaxiServices = async () => {
    try {
      setLoading(true);
      // This would fetch actual taxi services for the city
      // For now, we'll use mock data
      const mockServices = [
        {
          id: 1,
          type: 'Economy',
          description: 'Affordable taxi service for everyday travel',
          basePrice: 50,
          pricePerKm: 12,
          features: ['AC', 'GPS', 'Professional Driver'],
          rating: 4.5
        },
        {
          id: 2,
          type: 'Premium',
          description: 'Luxury taxi service with premium vehicles',
          basePrice: 100,
          pricePerKm: 20,
          features: ['AC', 'GPS', 'Professional Driver', 'WiFi', 'Water Bottle'],
          rating: 4.8
        }
      ];
      setTaxiServices(mockServices);
    } catch (err) {
      setError('Failed to fetch taxi services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Taxi Service in ${cityName} | BookYourRide - Best Taxi Service</title>
        <meta name="description" content="Book reliable taxi services in ${cityName}. Professional drivers, comfortable vehicles, and transparent pricing. Book your ride now!" />
        <meta name="keywords" content="taxi service ${cityName}, cab booking ${cityName}, taxi rental ${cityName}, ${cityName} taxi service" />
      </Helmet>
      
      <TaxiNavBar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#FDB813', fontWeight: 'bold' }}>
          Taxi Service in ${cityName}
        </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Professional taxi services with comfortable vehicles and experienced drivers
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Loading taxi services...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {taxiServices.map((service) => (
              <Grid item xs={12} md={6} key={service.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FaTaxi style={{ marginRight: 8, color: '#FDB813' }} />
                      <Typography variant="h6" component="h2">
                        {service.type} Taxi
                      </Typography>
                      <Box display="flex" alignItems="center" ml="auto">
                        <FaStar style={{ color: '#ffc107', marginRight: 4 }} />
                        <Typography variant="body2">{service.rating}</Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="h6" color="primary">
                        ₹{service.basePrice} + ₹{service.pricePerKm}/km
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      {service.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<FaTaxi />}
                      sx={{ mt: 'auto' }}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default ${cityName}TaxiPage;
`;
  return componentTemplate;
}

// Get all active taxi cities
const getTaxiCities = async (req, res) => {
  try {
    const taxiCities = await TaxiCity.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(taxiCities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taxi cities', error: err.message });
  }
};

// Get single taxi city by slug
const getTaxiCityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // First try to find by exact slug match
    let taxiCity = await TaxiCity.findOne({ slug, isActive: true });
    
    // If not found, try to find by city name (for short slugs like "indore")
    if (!taxiCity) {
      // Extract city name from slug (handle both formats)
      let cityName = slug;
      if (slug.startsWith('taxi-service-in-')) {
        cityName = slug.replace('taxi-service-in-', '');
      }
      
      // Try to find by city name
      taxiCity = await TaxiCity.findOne({ 
        name: { $regex: new RegExp(`^${cityName}$`, 'i') }, 
        isActive: true 
      });
    }
    
    if (!taxiCity) {
      return res.status(404).json({ message: 'Taxi city not found' });
    }
    
    res.json(taxiCity);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taxi city', error: err.message });
  }
};

// Get all taxi cities (admin)
const getAllTaxiCities = async (req, res) => {
  try {
    const taxiCities = await TaxiCity.find().sort({ createdAt: -1 });
    res.json(taxiCities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taxi cities', error: err.message });
  }
};

// Create new taxi city
const createTaxiCity = async (req, res) => {
  try {
    const { name, description, content, taxiTypes, serviceAreas, seoTitle, seoDescription, metaKeywords } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const capitalizedName = capitalizeCityName(name.trim());
    const slug = generateTaxiFullSlug(capitalizedName);
    
    // Check if taxi city already exists
    const existingCity = await TaxiCity.findOne({ 
      $or: [{ name: capitalizedName }, { slug: slug }] 
    });
    
    if (existingCity) {
      return res.status(400).json({ message: 'Taxi city already exists' });
    }

    // Get image URL from uploaded file or use null if no image
    const imageUrl = req.file ? req.file.path : null;

    // Parse taxi types if provided
    let parsedTaxiTypes = [];
    if (taxiTypes) {
      try {
        const rawTaxiTypes = JSON.parse(taxiTypes);
        // Transform string array to object array for Mongoose schema
        parsedTaxiTypes = rawTaxiTypes.map(taxiType => {
          if (typeof taxiType === 'string') {
            return {
              type: taxiType,
              description: '',
              basePrice: 0,
              pricePerKm: 0,
              isAvailable: true
            };
          }
          return taxiType; // Already an object
        });
      } catch (e) {
        parsedTaxiTypes = [];
      }
    }

    // Parse service areas if provided
    let parsedServiceAreas = [];
    if (serviceAreas) {
      try {
        parsedServiceAreas = JSON.parse(serviceAreas);
      } catch (e) {
        parsedServiceAreas = [];
      }
    }

    // Create new taxi city
    const taxiCity = new TaxiCity({
      name: capitalizedName,
      slug,
      description: description || '',
      content: content || '',
      image: imageUrl,
      taxiTypes: parsedTaxiTypes,
      serviceAreas: parsedServiceAreas,
      seoTitle: seoTitle || `Taxi Service in ${capitalizedName}`,
      seoDescription: seoDescription || `Book reliable taxi services in ${capitalizedName}. Professional drivers, comfortable vehicles, and transparent pricing.`,
      metaKeywords: metaKeywords || `taxi service ${capitalizedName}, cab booking ${capitalizedName}, taxi rental ${capitalizedName}, ${capitalizedName} taxi service`
    });

    await taxiCity.save();

    // Create React component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/taxi-cities-pages');
    const componentContent = createTaxiCityPageComponent(capitalizedName, slug);
    const componentFileName = `${capitalizedName}TaxiPage.jsx`;
    const componentFilePath = path.join(frontendPath, componentFileName);

    // Ensure directory exists
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true });
    }

    // Write component file
    fs.writeFileSync(componentFilePath, componentContent);

    res.status(201).json({
      message: 'Taxi city created successfully. Please restart the frontend server to see the new routes.',
      taxiCity,
      componentPath: componentFilePath,
      routes: {
        fullSlug: `/taxi/${slug}`,
        shortSlug: `/taxi/${generateShortSlug(capitalizedName)}`
      }
    });

  } catch (err) {
    console.error('Error creating taxi city:', err);
    res.status(500).json({ message: 'Failed to create taxi city', error: err.message });
  }
};

// Update taxi city
const updateTaxiCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, taxiTypes, serviceAreas, isActive, seoTitle, seoDescription, metaKeywords } = req.body;
    
    const taxiCity = await TaxiCity.findById(id);
    if (!taxiCity) {
      return res.status(404).json({ message: 'Taxi city not found' });
    }

    const oldName = taxiCity.name;
    const capitalizedName = name ? capitalizeCityName(name.trim()) : null;
    const newSlug = capitalizedName ? generateSlug(capitalizedName) : taxiCity.slug;
    
    // Get image URL from uploaded file or keep existing
    const imageUrl = req.file ? req.file.path : taxiCity.image;
    
    // Parse taxi types if provided
    let parsedTaxiTypes = taxiCity.taxiTypes;
    if (taxiTypes) {
      try {
        const rawTaxiTypes = JSON.parse(taxiTypes);
        // Transform string array to object array for Mongoose schema
        parsedTaxiTypes = rawTaxiTypes.map(taxiType => {
          if (typeof taxiType === 'string') {
            return {
              type: taxiType,
              description: '',
              basePrice: 0,
              pricePerKm: 0,
              isAvailable: true
            };
          }
          return taxiType; // Already an object
        });
      } catch (e) {
        // Keep existing if parsing fails
      }
    }

    // Parse service areas if provided
    let parsedServiceAreas = taxiCity.serviceAreas;
    if (serviceAreas) {
      try {
        parsedServiceAreas = JSON.parse(serviceAreas);
      } catch (e) {
        // Keep existing if parsing fails
      }
    }
    
    // Update taxi city
    const updatedTaxiCity = await TaxiCity.findByIdAndUpdate(
      id,
      {
        ...(capitalizedName && { name: capitalizedName, slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        image: imageUrl,
        taxiTypes: parsedTaxiTypes,
        serviceAreas: parsedServiceAreas,
        ...(isActive !== undefined && { isActive }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(metaKeywords !== undefined && { metaKeywords })
      },
      { new: true }
    );

    // If name changed, update component file
    if (capitalizedName && capitalizedName !== oldName) {
      const frontendPath = path.join(__dirname, '../../frontend/src/pages/taxi-cities-pages');
      const oldComponentPath = path.join(frontendPath, `${oldName}TaxiPage.jsx`);
      const newComponentPath = path.join(frontendPath, `${capitalizedName}TaxiPage.jsx`);
      
      // Remove old component file
      if (fs.existsSync(oldComponentPath)) {
        fs.unlinkSync(oldComponentPath);
      }
      
      // Create new component file
      const componentContent = createTaxiCityPageComponent(capitalizedName, newSlug);
      fs.writeFileSync(newComponentPath, componentContent);
    }

    res.json({ 
      message: 'Taxi city updated successfully',
      taxiCity: updatedTaxiCity
    });
  } catch (err) {
    console.error('Error updating taxi city:', err);
    res.status(500).json({ message: 'Failed to update taxi city', error: err.message });
  }
};

// Delete taxi city
const deleteTaxiCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const taxiCity = await TaxiCity.findById(id);
    if (!taxiCity) {
      return res.status(404).json({ message: 'Taxi city not found' });
    }

    // Remove component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/taxi-cities-pages');
    const componentPath = path.join(frontendPath, `${taxiCity.name}TaxiPage.jsx`);
    
    if (fs.existsSync(componentPath)) {
      fs.unlinkSync(componentPath);
    }

    await TaxiCity.findByIdAndDelete(id);

    res.json({ message: 'Taxi city deleted successfully' });
  } catch (err) {
    console.error('Error deleting taxi city:', err);
    res.status(500).json({ message: 'Failed to delete taxi city', error: err.message });
  }
};

// Get dynamic routes for all active taxi cities
const getTaxiCityRoutes = async (req, res) => {
  try {
    const taxiCities = await TaxiCity.find({ isActive: true });
    const routes = taxiCities.map(city => ({
      name: city.name,
      slug: city.slug,
      shortSlug: generateShortSlug(city.name),
      componentName: `${city.name}TaxiPage`
    }));
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taxi city routes', error: err.message });
  }
};

module.exports = {
  getTaxiCities,
  getTaxiCityBySlug,
  getAllTaxiCities,
  createTaxiCity,
  updateTaxiCity,
  deleteTaxiCity,
  getTaxiCityRoutes
};
