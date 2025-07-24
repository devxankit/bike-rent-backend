const express = require('express');
const { auth, admin } = require('../middleware/auth');
const upload = require('../utils/cloudinary');
const router = express.Router();
const User = require('../models/User');
const CityPage = require('../models/CityPage');
const fs = require('fs');
const path = require('path');

router.get('/dashboard', auth, admin, (req, res) => {
  try {
    console.log('[AdminRoute] Dashboard accessed by:', req.user.email);
    res.json({ message: 'Welcome to the admin dashboard!', user: req.user });
  } catch (err) {
    console.error('[AdminRoute] Dashboard error:', err);
    res.status(500).json({ message: 'Admin dashboard error', error: err.message });
  }
});

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// City Pages CRUD Operations

// Helper function to generate slug from city name (like existing pages)
function generateSlug(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${cleanName}-rent-bike-in-${cleanName}`;
}

// Helper function to generate short slug for component name
function generateShortSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Helper function to capitalize first letter of city name for React component naming
function capitalizeCityName(name) {
  if (!name || typeof name !== 'string') return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper function to update App.js with new routes
function updateAppJsRoutes() {
  try {
    const appJsPath = path.join(__dirname, '../../frontend/src/App.js');
    
    if (!fs.existsSync(appJsPath)) {
      console.error('App.js not found');
      return;
    }

    // Read current App.js content
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Get all city pages from database
    CityPage.find({ isActive: true }).then(cityPages => {
      // Generate import statements for dynamic city pages
      let imports = '';
      let routes = '';
      
      cityPages.forEach(city => {
        const componentName = `${city.name}BikesPage`;
        const shortSlug = generateShortSlug(city.name);
        
        imports += `import ${componentName} from './pages/cities-pages/${city.name}';\n`;
        
        // Add both short and full slug routes (like existing pages)
        routes += `            <Route path="/bikes/${shortSlug}" element={<${componentName} />} />\n`;
        routes += `            <Route path="/bikes/${city.slug}" element={<${componentName} />} />\n`;
      });
      
      // Find the position to insert imports (after existing city page imports)
      const importInsertPoint = appJsContent.indexOf('import DehradunBikesPage');
      if (importInsertPoint !== -1) {
        const lineEnd = appJsContent.indexOf('\n', importInsertPoint);
        appJsContent = appJsContent.slice(0, lineEnd + 1) + imports + appJsContent.slice(lineEnd + 1);
      }
      
      // Find the position to insert routes (after existing city routes)
      const routeInsertPoint = appJsContent.indexOf('<Route path="/bikes/dehradun-rent-bike-in-dehradun"');
      if (routeInsertPoint !== -1) {
        const lineEnd = appJsContent.indexOf('\n', routeInsertPoint);
        const nextLineEnd = appJsContent.indexOf('\n', lineEnd + 1);
        appJsContent = appJsContent.slice(0, nextLineEnd + 1) + '            \n' + routes + appJsContent.slice(nextLineEnd + 1);
      }
      
      // Write updated content back to App.js
      fs.writeFileSync(appJsPath, appJsContent);
      console.log('App.js updated with new city routes');
    }).catch(err => {
      console.error('Error updating App.js routes:', err);
    });
    
  } catch (error) {
    console.error('Error updating App.js:', error);
  }
}

// Helper function to create React component file
function createCityPageComponent(cityName, slug) {
  const componentTemplate = `import React, { useEffect, useState } from 'react';
import BikeCard from '../../components/BikeCard';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../../components/FilterSidebar';
import { FiX } from 'react-icons/fi';
import { generateCitySlug, generateBikesSlug } from '../../utils/slugUtils';

const ${cityName}BikesPage = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('${cityName}');
  const [allLocations, setAllLocations] = useState([]);
  const [bikeName, setBikeName] = useState("");
  const [price, setPrice] = useState(0);
  const [maxPrice] = useState(10000);
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    // Fetch all cities for the filter dropdown
    const fetchCities = async () => {
      try {
        const citiesRes = await api.get('/api/cities');
        const cityNames = citiesRes.data.map(city => city.name);
        setAllLocations(cityNames);
      } catch (err) {
        // fallback: use locations from bikes if city API fails
        try {
          const res = await api.get('/api/bikes', { params: { isBooked: false } });
          const locations = Array.from(new Set(res.data.map(b => b.location).filter(Boolean)));
          setAllLocations(locations);
        } catch {}
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/bikes', { params: { isBooked: false, location: '${cityName}' } });
        setBikes(res.data);
      } catch (err) {
        setError('Failed to load bikes.');
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  useEffect(() => {
    const fetchFilteredBikes = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { isBooked: false, location };
        if (bikeName) params.name = bikeName;
        if (price > 0) params.price = price;
        const res = await api.get('/api/bikes', { params });
        setBikes(res.data);
      } catch (err) {
        setError('Failed to load bikes.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredBikes();
  }, [location, bikeName, price]);

  // Redirect to city route on city change
  useEffect(() => {
    if (location && location.toLowerCase() !== '${cityName.toLowerCase()}') {
      const city = location.trim().toLowerCase();
      if (["indore", "mumbai", "goa", "haldwani", "kathgodam", "pithoragarh", "dehradun", "bhopal"].includes(city)) {
        // Use new slug format for navigation
        const slug = generateCitySlug(city);
        navigate(\`/bikes/\${slug}\`);
      } else if (location === "") {
        // Use slug for main bikes page
        const bikesSlug = generateBikesSlug();
        navigate(\`/bikes/\${bikesSlug}\`);
      }
    }
  }, [location, navigate]);

  const sortedBikes = [...bikes].sort((a, b) => new Date(b.year || b.createdAt) - new Date(a.year || a.createdAt));

  return (
    <>
      <Navbar onFilterToggle={() => setFilterOpen(true)} />
      <div className="flex min-h-screen h-screen bg-gray-50">
        {/* Filters */}
        <aside className="w-80 p-4 bg-white border-r hidden md:block sticky top-0 h-screen shadow-lg rounded-r-3xl" style={{ alignSelf: 'flex-start' }}>
          <FilterSidebar
            location={location}
            setLocation={setLocation}
            allLocations={allLocations}
            bikeName={bikeName}
            setBikeName={setBikeName}
            price={price}
            setPrice={setPrice}
            maxPrice={maxPrice}
            navigate={navigate}
          />
        </aside>
        {/* Mobile Filter Popup */}
        {filterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="p-2">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar
                location={location}
                setLocation={setLocation}
                allLocations={allLocations}
                bikeName={bikeName}
                setBikeName={setBikeName}
                price={price}
                setPrice={setPrice}
                maxPrice={maxPrice}
                navigate={navigate}
                compact={true}
              />
            </div>
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bikes in ${cityName}</h1>
              <p className="text-gray-600">Find the perfect bike for your journey in ${cityName}</p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : sortedBikes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No bikes available in ${cityName} at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedBikes.map((bike) => (
                  <BikeCard key={bike._id} bike={bike} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ${cityName}BikesPage;
`;
  return componentTemplate;
}

// Get all city pages
router.get('/city-pages', auth, admin, async (req, res) => {
  try {
    const cityPages = await CityPage.find().sort({ createdAt: -1 });
    res.json(cityPages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch city pages', error: err.message });
  }
});

// Get dynamic routes for all active city pages
router.get('/city-routes', async (req, res) => {
  try {
    const cityPages = await CityPage.find({ isActive: true });
    const routes = cityPages.map(city => ({
      name: city.name,
      slug: city.slug,
      shortSlug: generateShortSlug(city.name),
      componentName: `${city.name}BikesPage`
    }));
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch city routes', error: err.message });
  }
});

// Create new city page
router.post('/city-pages', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, seoTitle, seoDescription, metaKeywords } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Capitalize first letter for proper React component naming
    const capitalizedName = capitalizeCityName(name.trim());
    const slug = generateSlug(capitalizedName);
    
    // Check if city page already exists
    const existingCity = await CityPage.findOne({ 
      $or: [{ name: capitalizedName }, { slug: slug }] 
    });
    
    if (existingCity) {
      return res.status(400).json({ message: 'City page already exists' });
    }

    // Get image URL from uploaded file or use default
    const imageUrl = req.file ? req.file.path : '';

    // Create new city page
    const cityPage = new CityPage({
      name: capitalizedName,
      slug,
      description: description || '',
      image: imageUrl,
      seoTitle: seoTitle || `Bike Rental in ${capitalizedName}`,
      seoDescription: seoDescription || `Find and rent bikes in ${capitalizedName}. Best bike rental service with affordable prices.`,
      metaKeywords: metaKeywords || `bike rental ${capitalizedName}, rent bike ${capitalizedName}, ${capitalizedName} bike rental`
    });

    await cityPage.save();

    // Create React component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/cities-pages');
    const componentContent = createCityPageComponent(capitalizedName, slug);
    const componentFileName = `${capitalizedName}.jsx`;
    const componentFilePath = path.join(frontendPath, componentFileName);

    // Ensure directory exists
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true });
    }

    // Write component file
    fs.writeFileSync(componentFilePath, componentContent);

    res.status(201).json({ 
      message: 'City page created successfully. Please restart the frontend server to see the new routes.',
      cityPage,
      componentPath: componentFilePath,
      routes: {
        fullSlug: `/bikes/${slug}`,
        shortSlug: `/bikes/${generateShortSlug(capitalizedName)}`
      }
    });
  } catch (err) {
    console.error('Error creating city page:', err);
    res.status(500).json({ message: 'Failed to create city page', error: err.message });
  }
});

// Update city page
router.put('/city-pages/:id', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, seoTitle, seoDescription, metaKeywords } = req.body;
    
    const cityPage = await CityPage.findById(id);
    if (!cityPage) {
      return res.status(404).json({ message: 'City page not found' });
    }

    const oldName = cityPage.name;
    // Capitalize first letter for proper React component naming if name is provided
    const capitalizedName = name ? capitalizeCityName(name.trim()) : null;
    const newSlug = capitalizedName ? generateSlug(capitalizedName) : cityPage.slug;
    
    // Get image URL from uploaded file or keep existing
    const imageUrl = req.file ? req.file.path : cityPage.image;
    
    // Update city page
    const updatedCityPage = await CityPage.findByIdAndUpdate(
      id,
      {
        ...(capitalizedName && { name: capitalizedName, slug: newSlug }),
        ...(description !== undefined && { description }),
        image: imageUrl,
        ...(isActive !== undefined && { isActive }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(metaKeywords !== undefined && { metaKeywords })
      },
      { new: true }
    );

    // If name changed, update component file
    if (capitalizedName && capitalizedName !== oldName) {
      const frontendPath = path.join(__dirname, '../../frontend/src/pages/cities-pages');
      const oldComponentPath = path.join(frontendPath, `${oldName}.jsx`);
      const newComponentPath = path.join(frontendPath, `${capitalizedName}.jsx`);
      
      // Remove old component file
      if (fs.existsSync(oldComponentPath)) {
        fs.unlinkSync(oldComponentPath);
      }
      
      // Create new component file
      const componentContent = createCityPageComponent(capitalizedName, newSlug);
      fs.writeFileSync(newComponentPath, componentContent);
    }

    res.json({ 
      message: 'City page updated successfully',
      cityPage: updatedCityPage
    });
  } catch (err) {
    console.error('Error updating city page:', err);
    res.status(500).json({ message: 'Failed to update city page', error: err.message });
  }
});

// Delete city page
router.delete('/city-pages/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const cityPage = await CityPage.findById(id);
    if (!cityPage) {
      return res.status(404).json({ message: 'City page not found' });
    }

    // Delete component file
    const frontendPath = path.join(__dirname, '../../frontend/src/pages/cities-pages');
    const componentPath = path.join(frontendPath, `${cityPage.name}.jsx`);
    
    if (fs.existsSync(componentPath)) {
      fs.unlinkSync(componentPath);
    }

    // Delete from database
    await CityPage.findByIdAndDelete(id);

    res.json({ message: 'City page deleted successfully' });
  } catch (err) {
    console.error('Error deleting city page:', err);
    res.status(500).json({ message: 'Failed to delete city page', error: err.message });
  }
});

module.exports = router;
