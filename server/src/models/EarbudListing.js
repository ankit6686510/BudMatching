import mongoose from 'mongoose';

const earbudListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  side: {
    type: String,
    required: true,
    enum: ['left', 'right']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'matched', 'sold'],
    default: 'available'
  },
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EarbudListing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient searching
earbudListingSchema.index({ brand: 1, model: 1, side: 1, status: 1 });
earbudListingSchema.index({ location: 1 });

const EarbudListing = mongoose.model('EarbudListing', earbudListingSchema);

export default EarbudListing; 