import EarbudListing from '../models/EarbudListing.js';

export const createListing = async (req, res) => {
  try {
    const {
      brand,
      model,
      side,
      condition,
      price,
      description,
      images,
      location
    } = req.body;

    const listing = new EarbudListing({
      user: req.user.id,
      brand,
      model,
      side,
      condition,
      price,
      description,
      images,
      location
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
};

export const getListings = async (req, res) => {
  try {
    const {
      brand,
      model,
      side,
      condition,
      minPrice,
      maxPrice,
      location,
      status
    } = req.query;

    const query = {};

    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (side) query.side = side;
    if (condition) query.condition = condition;
    if (location) query.location = location;
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await EarbudListing.find(query)
      .populate('user', 'name location rating')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
};

export const getListing = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id)
      .populate('user', 'name location rating')
      .populate('matchedWith');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing', error: error.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updatedFields = req.body;
    Object.keys(updatedFields).forEach(key => {
      listing[key] = updatedFields[key];
    });

    await listing.save();

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.remove();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing', error: error.message });
  }
};

export const findMatches = async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Find potential matches based on brand, model, and opposite side
    const matches = await EarbudListing.find({
      brand: listing.brand,
      model: listing.model,
      side: listing.side === 'left' ? 'right' : 'left',
      status: 'available',
      _id: { $ne: listing._id }
    })
    .populate('user', 'name location rating');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error finding matches', error: error.message });
  }
};

export const markAsMatched = async (req, res) => {
  try {
    const { listingId, matchedListingId } = req.body;

    const listing = await EarbudListing.findById(listingId);
    const matchedListing = await EarbudListing.findById(matchedListingId);

    if (!listing || !matchedListing) {
      return res.status(404).json({ message: 'One or both listings not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to match this listing' });
    }

    // Update both listings
    listing.status = 'matched';
    listing.matchedWith = matchedListingId;
    matchedListing.status = 'matched';
    matchedListing.matchedWith = listingId;

    await Promise.all([listing.save(), matchedListing.save()]);

    res.json({
      message: 'Listings matched successfully',
      listing,
      matchedListing
    });
  } catch (error) {
    res.status(500).json({ message: 'Error matching listings', error: error.message });
  }
}; 