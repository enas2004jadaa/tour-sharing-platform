const userModel = require("../models/userSchema");
const LogAdmin = require("../models/logAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {

  try {
    const { firstName, lastName, dataBirth, phoneNumber, county, gender, email, password } = req.body;

    if (!firstName || !lastName || !dataBirth || !gender || !email || !password) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    const user = new userModel({
      firstName,
      lastName,
      dataBirth,
      phoneNumber,
      county,
      gender,
      email,
      password,
    });
    await user.save();

    return res.status(201).json({ message: "User registered successfully." });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: err.message
    });
  }
};

const login = (req, res) =>{
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  userModel.findOne({email}).then(async (result) => {
    if(!result){
      return res.status(403).json({
        success: false,
        message: "Email or Password is incorrect",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, result.password);
    if(!isPasswordValid){
      return res.status(403).json({
        success: false,
        message: "Email or Password is incorrect",
        });
    }
    if(result.isDeleted){
      return  res.status(403).json({
        success: false,
        message: "Your account has been deleted. Please contact support.",
      });
    }
    
    const token = jwt.sign(
        {userId: result._id, role: result.role , isDeleted: result.isDeleted},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
    if(result.role === 'admin' || result.role === 'moderator') {
      await LogAdmin.create({
        user: result._id,
        action: 'login',
        details: `User logged in: ${result.email}`,
        role: result.role
      });
    }


    res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          id: result._id,
          firstName:  result.firstName,
          lastName: result.lastName,
          email: result.email,
          image: result.image,
          bio: result.bio
        },
    });
  }).catch((err) => {
    res.status(500).json({
      success: false,
        message: "Server Error",
        err: err.message,
    });
  });
};

const getUserById = (req, res) => {
  const userId = req.params.id;
    userModel.findById(userId, '-password -__v -isDeleted -role -createdAt -updatedAt')
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
        message: "User retrieved successfully",
        user: user,
        });
    })
    .catch((err) => {
      //check if token is invalid
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      res.status(500).json({ message: "Server Error", error: err.message });
    });
};


const updateUser = (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;
    userModel.findByIdAndUpdate(userId, updateData, { new: true })
    .then((updatedUser) => {
        if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
        });
    })
    .catch((err) => {
        res.status(500).json({ message: "Server Error", error: err.message });
    });
};



module.exports = {
    register,
    login,
    getUserById,
    updateUser,
};