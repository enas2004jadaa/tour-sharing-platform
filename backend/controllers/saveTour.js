const User = require('../models/userSchema');

const saveTourForUser = (req, res) => {
    const userId = req.user._id;
    const { tourId } = req.params;
    if (!tourId) {
        return res.status(400).json({ message: "Tour ID is required." });
    }
    User.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            if (user.savedTours.includes(tourId)) {
                User.findByIdAndUpdate(userId, { $pull: { savedTours: tourId } })
                    .then(() => {
                        res.status(200).json({ 
                            action : "unsaved",
                            message: "Tour unsaved successfully." });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Error unsaving tour.", error: err });
                    });
            } else {
                User.findByIdAndUpdate(userId, { $addToSet: { savedTours: tourId } })
                    .then(() => {
                        res.status(200).json({ 
                            action : "saved",
                            message: "Tour saved successfully." });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Error saving tour.", error: err });
                    });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching user.", error: err });
        });
};

const getSavedToursByUser = (req, res) => {
    const userId = req.user._id;
    User.findById(userId)
    .populate({
      path: 'savedTours',
      match: { isDeleted: false , status: 'approved' },
      populate: [
        { path: 'category' },
        { path: 'publisher', select: '-password' },
        { path: 'comments' , populate: { path: 'user'} },
        { path: 'ratings', populate: { path: 'user' } },
        
      ]
    }).then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }           
            res.status(200).json(user.savedTours);

        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching saved tours.", error: err });
        });
};


module.exports = {
    saveTourForUser,
    getSavedToursByUser,
};

