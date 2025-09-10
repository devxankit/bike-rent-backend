const TourCity = require('../models/TourCity');
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

// Helper function to generate full slug for tour cities
function generateTourFullSlug(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `tour-packages-in-${cleanName}`;
}

// Helper function to create tour city page component
function createTourCityPageComponent(cityName, slug) {
  const componentTemplate = `import React, { useEffect, useState } from 'react';
import TourCard from '../../components/TourCard';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import TourFilterSidebar from '../../components/TourFilterSidebar';
import { FiX } from 'react-icons/fi';
import { generateTourCitySlug } from '../../utils/slugUtils';
import { Box, Typography } from '@mui/material';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const ${cityName}TourPage = ({ cityData }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('${cityName}');
  const [allLocations, setAllLocations] = useState([]);
  const [tourName, setTourName] = useState("");
  const [price, setPrice] = useState(0);
  const [maxPrice] = useState(50000);
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const scrollRef = useScrollAnimation();

  useEffect(() => {
    // Fetch all cities for the filter dropdown
    const fetchCities = async () => {
      try {
        const citiesRes = await api.get('/api/tour-cities');
        const cityNames = citiesRes.data.map(city => city.name);
        setAllLocations(cityNames);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setAllLocations(['${cityName}']); // Fallback
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/tours', { params: { isAvailable: true, location: '${cityName}' } });
        setTours(res.data);
      } catch (err) {
        setError('Failed to load tours.');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    const fetchFilteredTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { isAvailable: true, location };
        if (tourName) params.name = tourName;
        if (price > 0) params.price = price;
        const res = await api.get('/api/tours', { params });
        setTours(res.data);
      } catch (err) {
        setError('Failed to load tours.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredTours();
  }, [location, tourName, price]);

  // Sort tours so newest appear first (descending by createdAt)
  const sortedTours = [...tours].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Redirect to city route on city change
  useEffect(() => {
    if (location && location.toLowerCase() !== '${cityName.toLowerCase()}') {
      const city = location.trim().toLowerCase();
      if (city) {
        const slug = generateTourCitySlug(city);
        navigate(\`/tour/\${slug}\`);
      } else {
        navigate(\`/tour\`);
      }
    }
  }, [location, navigate]);

  return (
    <>
      <Navbar onFilterToggle={() => setFilterOpen(true)} />
      <div className="flex min-h-screen bg-gray-50">
        {/* Filters - Left Sidebar */}
        <aside className="w-80 p-4 bg-white border-r hidden md:block sticky top-0 h-screen shadow-lg rounded-r-3xl" style={{ alignSelf: 'flex-start' }}>
          <TourFilterSidebar
            location={location}
            setLocation={setLocation}
            allLocations={allLocations}
            tourName={tourName}
            setTourName={setTourName}
            price={price}
            setPrice={setPrice}
            maxPrice={maxPrice}
            navigate={navigate}
          />
        </aside>
        
        {/* Mobile Filter Popup */}
        {filterOpen && (
         <div className="fixed inset-0 z-[100010] flex md:hidden">
         {/* Overlay */}
         <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setFilterOpen(false)} />
         {/* Popup - always slide in from left */}
           <div className="absolute left-0 top-0 bg-white w-10/12 max-w-xs h-full shadow-xl p-2 animate-slide-in-left flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-yellow-500">Tour Filters</h2>
                 <button onClick={() => setFilterOpen(false)} aria-label="Close filter" className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400">
                   <FiX className="w-5 h-5 text-yellow-500" />
                  </button>
              </div>
              <TourFilterSidebar
                location={location}
                setLocation={setLocation}
                allLocations={allLocations}
                tourName={tourName}
                setTourName={setTourName}
                price={price}
                setPrice={setPrice}
                maxPrice={maxPrice}
                navigate={navigate}
                compact
              />
            </div>
          </div>
        )}
        
        {/* Main Content - Right Side */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tours in ${cityName}</h1>
              <p className="text-gray-600">Discover amazing tour packages in ${cityName}</p>
            </div>
            
            {/* Tour Listings */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : sortedTours.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No tours available in ${cityName} at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedTours.map((tour) => (
                  <TourCard key={tour._id} tour={tour} />
                ))}
              </div>
            )}
            
            {/* City Page Content - Displayed below tour listings in main content area */}
            {cityData && cityData.content && (
              <div ref={scrollRef} className="animate-fade-in-up mt-8">
                <Box 
                  sx={{ 
                    p: 4,
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #FDB813 0%, #E6A612 100%)',
                      borderRadius: '12px 12px 0 0'
                    }
                  }}
                >
                  <Box 
                    dangerouslySetInnerHTML={{ __html: cityData.content }}
                    sx={{
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: '#1f2937',
                        fontWeight: 600,
                        mb: 2,
                        mt: 3,
                        lineHeight: 1.3
                      },
                      '& h1': { fontSize: { xs: '1.75rem', md: '2rem' } },
                      '& h2': { fontSize: { xs: '1.5rem', md: '1.75rem' } },
                      '& h3': { fontSize: { xs: '1.25rem', md: '1.5rem' } },
                      '& h4': { fontSize: { xs: '1.125rem', md: '1.25rem' } },
                      '& h5': { fontSize: { xs: '1rem', md: '1.125rem' } },
                      '& h6': { fontSize: '1rem' },
                      '& p': {
                        color: '#4b5563',
                        lineHeight: 1.8,
                        mb: 3,
                        fontSize: '1rem',
                        textAlign: 'justify'
                      },
                      '& ul, & ol': {
                        color: '#4b5563',
                        lineHeight: 1.8,
                        mb: 3,
                        pl: 4
                      },
                      '& li': {
                        mb: 1.5,
                        position: 'relative'
                      },
                      '& ul li::before': {
                        content: '"•"',
                        color: '#FDB813',
                        fontWeight: 'bold',
                        position: 'absolute',
                        left: '-1.5rem'
                      },
                      '& a': {
                        color: '#FDB813',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '1px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderBottomColor: '#FDB813',
                          color: '#E6A612'
                        }
                      },
                      '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: 2,
                        my: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      },
                      '& blockquote': {
                        borderLeft: '4px solid #FDB813',
                        pl: 3,
                        ml: 0,
                        fontStyle: 'italic',
                        color: '#6b7280',
                        bgcolor: '#f9fafb',
                        p: 3,
                        borderRadius: 2,
                        my: 3,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
                          borderRadius: 2,
                          zIndex: -1
                        }
                      },
                      '& strong, & b': {
                        fontWeight: 700,
                        color: '#1f2937'
                      },
                      '& em, & i': {
                        fontStyle: 'italic',
                        color: '#6b7280'
                      },
                      '& table': {
                        width: '100%',
                        borderCollapse: 'collapse',
                        my: 3,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      '& th, & td': {
                        border: '1px solid #e5e7eb',
                        padding: '12px',
                        textAlign: 'left'
                      },
                      '& th': {
                        bgcolor: '#FDB813',
                        color: '#1f2937',
                        fontWeight: 600
                      },
                      '& tr:nth-of-type(even)': {
                        bgcolor: '#f9fafb'
                      }
                    }}
                  />
                </Box>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ${cityName}TourPage;
`;
  return componentTemplate;
}

// Get all active tour cities
const getTourCities = async (req, res) => {
  try {
    const tourCities = await TourCity.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tourCities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tour cities', error: err.message });
  }
};

// Get single tour city by slug
const getTourCityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // First try to find by exact slug match
    let tourCity = await TourCity.findOne({ slug, isActive: true });
    
    // If not found, try to find by city name (for short slugs like "indore")
    if (!tourCity) {
      // Extract city name from slug (handle both formats)
      let cityName = slug;
      if (slug.startsWith('tour-packages-in-')) {
        cityName = slug.replace('tour-packages-in-', '');
      }
      
      // Try to find by city name
      tourCity = await TourCity.findOne({ 
        name: { $regex: new RegExp(`^${cityName}$`, 'i') }, 
        isActive: true 
      });
    }
    
    if (!tourCity) {
      return res.status(404).json({ message: 'Tour city not found' });
    }
    
    res.json(tourCity);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tour city', error: err.message });
  }
};

// Get all tour cities (admin)
const getAllTourCities = async (req, res) => {
  try {
    const tourCities = await TourCity.find().sort({ createdAt: -1 });
    res.json(tourCities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tour cities', error: err.message });
  }
};

// Create new tour city
const createTourCity = async (req, res) => {
  try {
    const { name, description, content, tourTypes, serviceAreas, seoTitle, seoDescription, metaKeywords } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const capitalizedName = capitalizeCityName(name.trim());
    const slug = generateTourFullSlug(capitalizedName);
    
    // Check if tour city already exists
    const existingCity = await TourCity.findOne({ 
      $or: [{ name: capitalizedName }, { slug: slug }] 
    });
    
    if (existingCity) {
      return res.status(400).json({ message: 'Tour city already exists' });
    }

    // Get image URL from uploaded file or use null if no image
    const imageUrl = req.file ? req.file.path : null;

    // Parse tour types if provided
    let parsedTourTypes = [];
    if (tourTypes) {
      try {
        const rawTourTypes = JSON.parse(tourTypes);
        // Transform string array to object array for Mongoose schema
        parsedTourTypes = rawTourTypes.map(tourType => {
          if (typeof tourType === 'string') {
            return {
              type: tourType,
              description: '',
              basePrice: 0,
              duration: '',
              isAvailable: true
            };
          }
          return tourType; // Already an object
        });
      } catch (e) {
        parsedTourTypes = [];
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

    // Create new tour city
    const tourCity = new TourCity({
      name: capitalizedName,
      slug,
      description: description || '',
      content: content || '',
      image: imageUrl,
      tourTypes: parsedTourTypes,
      serviceAreas: parsedServiceAreas,
      seoTitle: seoTitle || `Tour Packages in ${capitalizedName}`,
      seoDescription: seoDescription || `Explore amazing tour packages in ${capitalizedName}. Discover local attractions, cultural experiences, and adventure tours.`,
      metaKeywords: metaKeywords || `tour packages ${capitalizedName}, ${capitalizedName} tours, travel ${capitalizedName}, ${capitalizedName} tourism`
    });

    await tourCity.save();

    // Create React component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/tour-cities-pages');
    const componentContent = createTourCityPageComponent(capitalizedName, slug);
    const componentFileName = `${capitalizedName}TourPage.jsx`;
    const componentFilePath = path.join(frontendPath, componentFileName);

    // Ensure directory exists
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true });
    }

    // Write component file
    fs.writeFileSync(componentFilePath, componentContent);

    res.status(201).json({
      message: 'Tour city created successfully. Please restart the frontend server to see the new routes.',
      tourCity,
      componentPath: componentFilePath,
      routes: {
        fullSlug: `/tour/${slug}`,
        shortSlug: `/tour/${generateShortSlug(capitalizedName)}`
      }
    });

  } catch (err) {
    console.error('Error creating tour city:', err);
    res.status(500).json({ message: 'Failed to create tour city', error: err.message });
  }
};

// Update tour city
const updateTourCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, content, tourTypes, serviceAreas, isActive, seoTitle, seoDescription, metaKeywords } = req.body;
    
    const tourCity = await TourCity.findById(id);
    if (!tourCity) {
      return res.status(404).json({ message: 'Tour city not found' });
    }

    const oldName = tourCity.name;
    const capitalizedName = name ? capitalizeCityName(name.trim()) : null;
    const newSlug = capitalizedName ? generateTourFullSlug(capitalizedName) : tourCity.slug;
    
    // Get image URL from uploaded file or keep existing
    const imageUrl = req.file ? req.file.path : tourCity.image;
    
    // Parse tour types if provided
    let parsedTourTypes = tourCity.tourTypes;
    if (tourTypes) {
      try {
        const rawTourTypes = JSON.parse(tourTypes);
        // Transform string array to object array for Mongoose schema
        parsedTourTypes = rawTourTypes.map(tourType => {
          if (typeof tourType === 'string') {
            return {
              type: tourType,
              description: '',
              basePrice: 0,
              duration: '',
              isAvailable: true
            };
          }
          return tourType; // Already an object
        });
      } catch (e) {
        // Keep existing if parsing fails
      }
    }

    // Parse service areas if provided
    let parsedServiceAreas = tourCity.serviceAreas;
    if (serviceAreas) {
      try {
        parsedServiceAreas = JSON.parse(serviceAreas);
      } catch (e) {
        // Keep existing if parsing fails
      }
    }
    
    // Update tour city
    const updatedTourCity = await TourCity.findByIdAndUpdate(
      id,
      {
        ...(capitalizedName && { name: capitalizedName, slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        image: imageUrl,
        tourTypes: parsedTourTypes,
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
      const frontendPath = path.join(__dirname, '../../frontend/src/pages/tour-cities-pages');
      const oldComponentPath = path.join(frontendPath, `${oldName}TourPage.jsx`);
      const newComponentPath = path.join(frontendPath, `${capitalizedName}TourPage.jsx`);
      
      // Remove old component file
      if (fs.existsSync(oldComponentPath)) {
        fs.unlinkSync(oldComponentPath);
      }
      
      // Create new component file
      const componentContent = createTourCityPageComponent(capitalizedName, newSlug);
      fs.writeFileSync(newComponentPath, componentContent);
    }

    res.json({ 
      message: 'Tour city updated successfully',
      tourCity: updatedTourCity
    });
  } catch (err) {
    console.error('Error updating tour city:', err);
    res.status(500).json({ message: 'Failed to update tour city', error: err.message });
  }
};

// Delete tour city
const deleteTourCity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tourCity = await TourCity.findById(id);
    if (!tourCity) {
      return res.status(404).json({ message: 'Tour city not found' });
    }

    // Remove component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/tour-cities-pages');
    const componentPath = path.join(frontendPath, `${tourCity.name}TourPage.jsx`);
    
    if (fs.existsSync(componentPath)) {
      fs.unlinkSync(componentPath);
    }

    await TourCity.findByIdAndDelete(id);

    res.json({ message: 'Tour city deleted successfully' });
  } catch (err) {
    console.error('Error deleting tour city:', err);
    res.status(500).json({ message: 'Failed to delete tour city', error: err.message });
  }
};

// Get dynamic routes for all active tour cities
const getTourCityRoutes = async (req, res) => {
  try {
    const tourCities = await TourCity.find({ isActive: true });
    const routes = tourCities.map(city => ({
      name: city.name,
      slug: city.slug,
      shortSlug: generateShortSlug(city.name),
      componentName: `${city.name}TourPage`
    }));
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tour city routes', error: err.message });
  }
};

module.exports = {
  getTourCities,
  getTourCityBySlug,
  getAllTourCities,
  createTourCity,
  updateTourCity,
  deleteTourCity,
  getTourCityRoutes
};
