"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuth = (req, res, next) => {
    const token = req.header('Authorization');
    // Check if token is provided
    if (!token) {
        res.status(401).json({ status: 0, message: 'Invalid Token or No token Provided' });
        return;
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY); // Explicitly cast the decoded token
    req.user = { id: decoded.id }; // Attach user data to req.user
    console.log(req.user, 'user....................');
    next(); // Pass control to the next middleware or route handler
};
exports.default = userAuth;
