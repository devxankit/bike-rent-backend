const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const upload = require('../utils/cloudinary');
const Blog = require('../models/Blog');

// Public routes - Get all published blogs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const query = { status: 'published' };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Don't include full content in list

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// Public route - Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// Public route - Get related blogs
router.get('/:slug/related', async (req, res) => {
  try {
    const currentBlog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });

    if (!currentBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find related blogs based on tags
    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlog._id },
      status: 'published',
      tags: { $in: currentBlog.tags }
    })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(4)
    .select('-content');

    res.json(relatedBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch related blogs', error: error.message });
  }
});

// Public route - Get popular blogs
router.get('/popular/top', async (req, res) => {
  try {
    const popularBlogs = await Blog.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ views: -1 })
      .limit(5)
      .select('-content');

    res.json(popularBlogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch popular blogs', error: error.message });
  }
});

// Admin routes - Get all blogs (including drafts)
router.get('/admin/all', auth, admin, async (req, res) => {
  console.log('[DEBUG] /api/blogs/admin/all requested by:', req.user ? req.user.email : 'Unknown');
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('[ERROR] /api/blogs/admin/all:', error);
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// Admin route - Create new blog
router.post('/admin', auth, admin, upload.single('thumbnail'), async (req, res) => {
  try {
    // Debug logging for file and body
    console.log('DEBUG /api/blogs/admin req.file:', req.file);
    console.log('DEBUG /api/blogs/admin req.body:', req.body);
    const {
      title,
      slug, // <-- ADD THIS
      content,
      excerpt,
      status,
      tags,
      seoTitle,
      seoDescription,
      metaKeywords,
      imageAlt // <-- NEW FIELD
    } = req.body;

    const blogData = {
      title,
      slug, // <-- ADD THIS
      content,
      excerpt,
      status: status || 'draft',
      author: req.user._id,
      seoTitle,
      seoDescription,
      metaKeywords,
      imageAlt // <-- NEW FIELD
    };

    // Handle tags (convert string to array if needed)
    if (tags) {
      blogData.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle thumbnail upload or direct URL
    if (req.file) {
      blogData.thumbnail = req.file.path; // Cloudinary URL
    } else if (req.body.thumbnail && req.body.thumbnail.trim()) {
      blogData.thumbnail = req.body.thumbnail.trim(); // Direct URL from frontend
    }

    const blog = new Blog(blogData);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');
    res.status(201).json({ message: 'Blog created successfully', blog: populatedBlog });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create blog', error: error.message });
  }
});

// Admin route - Update blog
router.put('/admin/:id', auth, admin, upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      status,
      tags,
      seoTitle,
      seoDescription,
      metaKeywords,
      imageAlt // <-- NEW FIELD
    } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.excerpt = excerpt || blog.excerpt;
    blog.status = status || blog.status;
    blog.seoTitle = seoTitle || blog.seoTitle;
    blog.seoDescription = seoDescription || blog.seoDescription;
    blog.metaKeywords = metaKeywords || blog.metaKeywords;
    blog.imageAlt = imageAlt !== undefined ? imageAlt : blog.imageAlt; // <-- NEW FIELD

    // Handle tags
    if (tags) {
      blog.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Handle thumbnail upload or direct URL
    if (req.file) {
      blog.thumbnail = req.file.path; // Cloudinary URL
    } else if (req.body.thumbnail && req.body.thumbnail.trim()) {
      blog.thumbnail = req.body.thumbnail.trim(); // Direct URL from frontend
    }

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');
    res.json({ message: 'Blog updated successfully', blog: populatedBlog });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update blog', error: error.message });
  }
});

// Admin route - Delete blog
router.delete('/admin/:id', auth, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog', error: error.message });
  }
});

// Admin route - Get single blog for editing
router.get('/admin/edit/:id', auth, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// Admin route - Toggle blog status
router.patch('/admin/:id/status', auth, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = blog.status === 'published' ? 'draft' : 'published';
    await blog.save();

    res.json({ message: 'Blog status updated successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog status', error: error.message });
  }
});

// Public route - Get all tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json(tags.map(tag => ({ name: tag._id, count: tag.count })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tags', error: error.message });
  }
});

module.exports = router;
