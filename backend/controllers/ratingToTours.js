const tourRating = require('../models/tourSchema');

const createRating = async (req, res) => {
    try {
        const { tourId, rating } = req.body;
        const userId = req.user.id;

        if (!tourId || !rating) {
            return res.status(400).json({ message: 'tourId and rating are required' });
        }

        const tour = await tourRating.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        const existingRating = tour.ratings.find(r => r.user.toString() === userId);

        if (existingRating) {
            existingRating.rating = rating;
        } else {
            tour.ratings.push({ user: userId, rating });
        }

        await tour.save();

        await tour.populate([
            { path: "ratings.user" },
            { path: "comments.user" },
            { path: "publisher" },
            {path: "category"}
        ]);

        return res.status(existingRating ? 200 : 201).json({
            message: existingRating ? 'Rating updated successfully' : 'Rating added successfully',
            data: tour
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', "error": error });
    }
};

const editRating = async (req, res) => {
    try {
        const { tourId, ratingId, rating } = req.body;
        const userId = req.user.id;
        const tour = await tourRating.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        const existingRating = tour.ratings.id(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found' });
        }
        if (existingRating.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        existingRating.rating = rating;
        await tour.save();
        res.status(200).json({ message: 'Rating updated successfully', rating: existingRating });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const deleteRating = async (req, res) => {
    try {
        const { tourId, ratingId } = req.body;
        const userId = req.user.id;

        const tour = await tourRating.findById(tourId);
        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        const existingRating = tour.ratings.find(r => r._id.toString() === ratingId);
        if (!existingRating) return res.status(404).json({ message: 'Rating not found' });
        if (existingRating.user.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

        tour.ratings = tour.ratings.filter(r => r._id.toString() !== ratingId);

        await tour.save();
        await tour.populate([
            { path: "ratings.user" },
            { path: "comments.user" },
            { path: "publisher" },
            {path: "category"}
        ]);
        res.status(200).json({ message: 'Rating deleted successfully', data: tour });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    createRating,
    editRating,
    deleteRating
};
