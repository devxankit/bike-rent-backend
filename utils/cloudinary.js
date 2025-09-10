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

// Create storage for tour cities
const tourCityStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bike_rent_tour_cities',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Export different upload middlewares for different content types
const bikeUpload = multer({ storage: bikeStorage });
const taxiUpload = multer({ storage: taxiStorage });
const taxiCityUpload = multer({ storage: taxiCityStorage });
const tourCityUpload = multer({ storage: tourCityStorage });
const blogUpload = multer({ storage: blogStorage });
const cityUpload = multer({ storage: cityStorage });

// Default export for backward compatibility (bikes)
const upload = bikeUpload;

module.exports = {
  upload, // Default for bikes
  bikeUpload,
  taxiUpload,
  taxiCityUpload,
  tourCityUpload,
  blogUpload,
  cityUpload
}; 