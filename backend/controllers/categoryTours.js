const categoryTours = require('../models/categorySchema');
const tourModel = require('../models/tourSchema');
const createCategory = (req, res) => {
    const { name, imageUrl } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required." });
    }
    const category = new categoryTours({
        name,
        image: imageUrl || ''
    });
    category.save()
    .then(() => res.status(201).json({ message: "Category created successfully." }))
    .catch((err) =>
      res.status(500).json({ message: "Error creating category.", error: err })
    );
}

const getAllCategories = (req, res) => {
    categoryTours.find()
    .then((categories) => res.status(200).json(categories))
    .catch((err) =>
      res.status(500).json({ message: "Error fetching categories.", error: err })
    );
}

const deleteCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    categoryTours.findByIdAndDelete(categoryId)
    .then((deletedCategory) => {
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }
        res.status(200).json({ message: "Category deleted successfully." });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error deleting category.", error: err })
    );    
}

const getTopCategories = async (req, res) => {
    try {
        const topCategories = await tourModel.aggregate([
            {
                $match: { status: "approved" }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    _id: "$categoryDetails._id",
                    name: "$categoryDetails.name",
                    description: "$categoryDetails.description",
                    image: "$categoryDetails.image",
                    count: 1
                }
            },
        ]);
        res.status(200).json({ 
            status: "successfully",
             data: topCategories });
    } catch (error) {
        res.status(500).json({ message: "Error fetching top categories.", error: error });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    deleteCategory,
    getTopCategories
};
