const Tour = require('../models/tourSchema');

const createComment = async (req, res) => {
    try {
        const { tourId, content } = req.body;
        const userId = req.user.id;
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        const newComment = { user: userId, content };
        tour.comments.push(newComment);
        await tour.save();

        const updatedTour = await Tour.findById(tourId)
  .select({ comments: { $slice: -1 } }) 
  .populate('comments.user', 'firstName lastName image');

const addedComment = updatedTour.comments[0];

res.status(201).json({
  message: 'Comment added successfully',
  data: addedComment
});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error : error.message });
    }
};

const editComment = async (req, res) => {
    try {
        const { tourId, commentId, content } = req.body;
        const userId = req.user.id;
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        const comment = tour.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        comment.content = content;
        await tour.save();
        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { tourId, commentId } = req.body;
        const userId = req.user.id;
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        const comment = tour.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        comment.remove();
        await tour.save();
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    createComment,
    editComment,
    deleteComment,
};
