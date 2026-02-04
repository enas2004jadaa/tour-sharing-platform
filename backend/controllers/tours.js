const tours = require('../models/tourSchema');
const User = require('../models/userSchema');

const createTour = (req, res) => {
  const {
    name,
    description,
    images,
    videos,
    location,
    coordinates,
    category,
    } = req.body;

    const publisher = req.user._id;

    if (!name || !description || !location || !category || !publisher) {
        return res.status(400).json({ message: "All required fields must be filled." });
    }

    const tour = new tours({
        name,
        description,
        images,
        videos,
        location,
        coordinates,
        category,
        publisher, 
    });
    tour
    .save()
    .then(() => {
        User.findByIdAndUpdate(publisher, { $push: { tour: tour._id } })
            .then(() => {
                res.status(201).json({
                    message: "Tour created successfully."
                });
            })
            .catch((err) => {
                res.status(500).json({ message: "Error updating user.", error: err });
            });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error creating tour.", error: err })
    );
}

const updateTour = (req, res) => {
    const tourId = req.params.tourId;
    const updateData = { ...req.body , status: 'pending' };
    tours.findByIdAndUpdate(tourId, updateData, { new: true })
    .then((updatedTour) => {
        if (!updatedTour) {
            return res.status(404).json({ message: "Tour not found." });
        }
        res.status(200).json(updatedTour);
    })
    .catch((err) =>
      res.status(500).json({ message: "Error updating tour.", error: err })
    );
}

const deleteTour = (req, res) => {
    const tourId = req.params.tourId;
    
    tours.findByIdAndUpdate(tourId, { isDeleted: true }, { new: true })
    .then((deletedTour) => {
        if (!deletedTour) {
            return res.status(404).json({ message: "Tour not found." });
        }
        res.status(200).json({ message: "Tour deleted successfully." });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error deleting tour.", error: err })
    );    
}


const getAllTours = async (req, res) => {
    
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role === 'admin' || decoded.role === 'moderator') {
                const allTours = await tours.find({ isDeleted: false })
                .populate('category')
                .populate('publisher', '-password')
                .populate({
                    path: 'comments',
                    populate: { path: 'user', select: 'firstName lastName image' } 
                })
                .populate({
                    path: 'ratings',
                    populate: { path: 'user', select: 'firstName lastName image' }
                });
                allTours.sort((a, b) => b.createdAt - a.createdAt);
                res.status(200).json(allTours);
            }
        }

        const allTours = await tours.find({ isDeleted: false , status: 'approved' })
        .populate('category')
        .populate('publisher', '-password')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'firstName lastName image' } 
        })
        .populate({
            path: 'ratings',
            populate: { path: 'user', select: 'firstName lastName image' }
        });
        allTours.sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json(allTours);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tours.", error: err });
    }  
};

const searchTours = async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "Keyword required" });
  }

  try {
    const result = await tours.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'publisher',
          foreignField: '_id',
          as: 'publisher'
        }
      },

      { $unwind: "$category" },
      { $unwind: "$publisher" },

      {
        $match: {
          $and: [
            {
              $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { "category.name": { $regex: keyword, $options: "i" } },
                { "publisher.firstName": { $regex: keyword, $options: "i" } },
                { "publisher.lastName": { $regex: keyword, $options: "i" } }
              ]
            },
            { isDeleted: false },
            { status: "approved" }
          ]
        }
      }
    ]);

    res.status(200).json({ tours: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const filterToursByCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    tours.find({ category: categoryId , isDeleted: false , status: 'approved' })
    .populate("publisher", "-password")
    .populate("category")
    .populate("comments")
    .populate("ratings").then((result) => {
    return res.status(200).json({ tours: result });
    }).catch((err) => {
    return res.status(500).json({ message: "Error filtering tours by category.", error: err });
    });
}

const getPopularTours = async (req, res) => {
  try {
    const result = await tours.aggregate([
      {
        $addFields: {
          ratingsCount: { $size: "$ratings" },
          commentsCount: { $size: "$comments" }
        }
      },

      {
        $sort: {
          ratingsCount: -1,   
          commentsCount: -1  
        }
      },
      { $match: { isDeleted: false, status: 'approved' } },

      { $limit: 3 }
    ]);
    await tours.populate(result, [
      { path: "publisher", select: "-password" },
      { path: "category" },
      { 
        path: "comments",
        populate: { path: "user", select: "-password" } 
      },
      { path: "ratings",
        populate: { path: "user", select: "-password" }
      }
      
    ]);

    return res.status(200).json({ tours: result });

  } catch (err) {
    return res.status(500).json({ 
      message: "Error fetching popular tours.", 
      error: err 
    });
  }
};

const getAllToursByUserId = (req, res) => {
    const userId = req.params.userId;
    tours.find({ publisher: userId , isDeleted: false , status: 'approved' })
    .populate("publisher", "-password")
    .populate("category")
    .populate({
        path: 'comments',
        populate: { path: 'user' }
    })
    .populate({
        path: 'ratings',
        populate: { path: 'user' }
    })
    .then((result) => {
    return res.status(200).json({ tours: result });
    }).catch((err) => {
    return res.status(500).json({ message: "Error fetching user's tours.", error: err });
    });
}

const getTourById = (req, res) => {
    const tourId = req.params.tourId;
    tours.findById(tourId)
    .populate("publisher", "-password")
    .populate("category")
    .populate({
        path: 'comments',
        populate: { path: 'user' }
    })
    .populate({
        path: 'ratings',
        populate: { path: 'user' }
    })
    .then((result) => {
    if (!result) {
        return res.status(404).json({ message: "Tour not found." });
    }
    return res.status(200).json({ tour: result });
    }).catch((err) => {
    return res.status(500).json({ message: "Error fetching tour.", error: err });
    });
}

module.exports = {
    createTour,
    getAllTours,
    getAllToursByUserId,
    getTourById,
    searchTours,
    filterToursByCategory,
    getPopularTours,
    updateTour,
    deleteTour,
};
