const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for bikes
const bikeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_bikes',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Create storage for taxi cities
const taxiCityStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_taxi_cities',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Create storage for blogs
const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_blogs',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Create storage for city pages
const cityStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_city_pages',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Create storage for taxis
const taxiStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_taxis',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Create storage for tours
const tourStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_tours',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    resource_type: 'auto',
  },
  timeout: 60000, // 1 minute timeout
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

// Export different upload middlewares for different content types
const bikeUpload = multer({ storage: bikeStorage });
const taxiUpload = multer({ storage: taxiStorage });
const taxiCityUpload = multer({ storage: taxiCityStorage });
const blogUpload = multer({ storage: blogStorage });
const cityUpload = multer({ storage: cityStorage });
const tourUpload = multer({ 
  storage: tourStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type - be more permissive
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
      'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'
    ];
    
    if (file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(`[TourUpload] Rejected file: ${file.originalname}, type: ${file.mimetype}`);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed.`), false);
    }
  }
});

// Default export for backward compatibility (bikes)
const upload = bikeUpload;

module.exports = {
  upload, // Default for bikes
  bikeUpload,
  taxiUpload,
  taxiCityUpload,
  blogUpload,
  cityUpload,
  tourUpload
}; 