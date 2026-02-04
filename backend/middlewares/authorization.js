const jwt = require('jsonwebtoken');

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const decoded = token && jwt.verify(token, process.env.JWT_SECRET);
        
        const role = decoded && decoded.role;
        
        if (!role) {
            return res.status(401).json({ message: 'Unauthorized. User not authenticated.' });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Forbidden. You do not have permission to access this resource.' });
        }
        next();
    };
}

module.exports = authorizeRoles;