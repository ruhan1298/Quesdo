"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const notificationQueue_1 = require("../../middleware/notificationQueue");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const model_1 = __importStar(require("../../model"));
const sequelize_1 = require("sequelize");
const Interests_1 = __importDefault(require("../models/Interests"));
const post_1 = __importDefault(require("../models/post"));
const Report_1 = __importDefault(require("../models/Report"));
const customerService_1 = __importDefault(require("../models/customerService"));
// import GroupMember from "../models/GroupMember";
const Notification_1 = __importDefault(require("../models/Notification"));
const haversine_distance_1 = __importDefault(require("haversine-distance")); // npm i haversine-distance
const templatePath = path_1.default.join(__dirname, '../../views/otptemplate.hbs');
const source = fs_1.default.readFileSync(templatePath, 'utf-8');
const template = handlebars_1.default.compile(source);
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of earth in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Number(d.toFixed(2)); // round to 2 decimal places
}
exports.default = {
    UserRegister: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { password, email, deviceToken, deviceType } = req.body;
            // const image ='uploads\\bead2399-9898-4b74-9650-bf2facdaaafa.png'
            // Validate input
            if (!email || !password) {
                return res.json({ status: 0, message: "All input is required." });
            }
            // Check if user already exists
            const oldUser = yield user_1.default.findOne({ where: { email } });
            if (oldUser) {
                return res.json({ status: 0, message: "Email already exists." });
            }
            // Encrypt password
            const encryptedPassword = yield bcrypt_1.default.hash(password, 10);
            // Create new user
            const newUser = yield user_1.default.create({
                password: encryptedPassword,
                email,
                deviceToken,
                deviceType
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: newUser.id,
                email: newUser.email,
            }, process.env.TOKEN_KEY);
            // Prepare response data
            const data = {
                id: newUser.id,
                email: newUser.email,
                image: newUser.image,
                token,
            };
            return res.json({ status: 1, message: "User registered successfully", data });
        }
        catch (error) {
            console.error("Error in customerRegister:", error);
            return res.status(500).json({ status: 0, message: "Internal Server Error" });
        }
    }),
    UserLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, deviceToken, deviceType } = req.body;
            console.log(req.body, "BODY");
            // Validate user input
            if (!(email && password)) {
                return res.status(400).json({ status: 0, message: "All input is required." });
            }
            // Find user by email
            const user = yield user_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ status: 0, message: "Invalid Email" });
            }
            user.deviceToken = deviceToken,
                user.deviceType = deviceType;
            yield user.save(); // Save the updated user object
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ status: 0, message: "Invalid Password" });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                // fullName: user.fullName,
                email: user.email,
            }, process.env.TOKEN_KEY);
            // Respond with user data and the generated token
            return res.status(200).json({
                status: 1,
                message: "Login successful",
                data: {
                    id: user.id,
                    // fullName: user.fullName,
                    email: user.email,
                    // mobilenumber: user.mobilenumber,
                    token: token,
                    image: user.image,
                    iscompletedProfile: user.isCompletedProfile
                },
            });
        }
        catch (error) {
            // Handle unexpected errors
            console.error(error);
            return res.status(500).json({ status: 0, message: "Internal server error" });
        }
    }),
    UserUpdate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                console.log("User ID not found in request.");
                return res.status(400).json({ status: 0, message: 'User ID not found' });
            }
            let { FirstName, email, dob, interests } = req.body;
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            // Parse interests if it's a string (e.g. from multipart/form-data)
            if (typeof interests === 'string') {
                try {
                    interests = interests.split(',').map(item => item.trim());
                }
                catch (e) {
                    console.warn("Failed to parse interests. Got:", interests);
                    interests = [];
                }
            }
            // Clean and convert interests to numbers, removing invalid entries
            if (Array.isArray(interests)) {
                interests = interests
                    .map((item) => {
                    if (typeof item === 'string') {
                        // Remove any surrounding brackets or non-numeric chars
                        return parseInt(item.replace(/[\[\]]/g, ''), 10);
                    }
                    return item;
                })
                    .filter((num) => !isNaN(num)); // Remove NaNs
            }
            else {
                interests = [];
            }
            console.log("Incoming data:", { FirstName, email, dob, interests, image });
            const user = yield user_1.default.findOne({ where: { id: userId } });
            if (!user) {
                console.log("User not found in database.");
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            // Update user info
            user.id = userId || user.id;
            user.FirstName = FirstName || user.FirstName;
            user.email = email || user.email;
            user.image = image || user.image;
            user.dob = dob || user.dob;
            yield user.save();
            console.log("User profile updated successfully.");
            if (interests.length > 0) {
                console.log("Processing interests...");
                // Step 1: Get existing interests
                const existingInterests = yield Interests_1.default.findAll({ where: { userId } });
                const existingSubcategoryIds = existingInterests.map(i => i.subcategoryId);
                console.log("Existing interests:", existingSubcategoryIds);
                // Step 2: Filter new ones
                const newUniqueInterests = interests
                    .filter((subcategoryId) => !existingSubcategoryIds.includes(subcategoryId))
                    .map((subcategoryId) => ({
                    subcategoryId,
                    userId,
                }));
                console.log("New unique interests to add:", newUniqueInterests);
                // Step 3: Insert new interests
                if (newUniqueInterests.length > 0) {
                    yield Interests_1.default.bulkCreate(newUniqueInterests);
                    console.log("New interests inserted successfully.");
                }
                else {
                    console.log("No new interests to add.");
                }
            }
            else {
                console.log("No valid interests array provided.");
            }
            // Step 4: Fetch all updated interests
            const updatedInterests = yield Interests_1.default.findAll({ where: { userId } });
            const updatedSubcategoryIds = updatedInterests.map(i => i.subcategoryId);
            console.log("Final interests after update:", updatedSubcategoryIds);
            return res.status(200).json({
                status: 1,
                message: 'Profile updated successfully',
                data: {
                    id: user.id,
                    firstName: user.FirstName,
                    email: user.email,
                    image: user.image,
                    dateOfBirth: user.dob,
                    // interests: updatedSubcategoryIds,
                },
            });
        }
        catch (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    ChangePass: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ status: 0, message: 'Old and new passwords are required' });
            }
            if (oldPassword === newPassword) {
                return res.status(400).json({ status: 0, message: "New password cannot be the same as the old password" });
            }
            const user = yield user_1.default.findByPk((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            console.log(user, "USER GET");
            if (!user) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            const isValidPassword = yield bcrypt_1.default.compare(oldPassword, user.password); // Ensure 'user.password' is a string
            if (!isValidPassword) {
                return res.status(400).json({ status: 0, message: 'Invalid old password' });
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
            yield user.save();
            return res.status(200).json({ status: 1, message: "Password changed successfully" });
        }
        catch (err) {
            console.error("Error:", err.message);
            return res.status(500).json({ status: 0, message: "Failed to change password" });
        }
    }),
    SocialLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, socialType, socialId, FirstName } = req.body;
        try {
            // Check if user exists in the database based on email
            let user = yield user_1.default.findOne({ where: { email } });
            if (user) {
                user.socialId = socialId;
                user.socialType = socialType;
                user.FirstName = FirstName !== null && FirstName !== void 0 ? FirstName : user.FirstName;
                // Save the updated user details
                yield user.save();
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.TOKEN_KEY);
                // Send response back to client
                return res.json({
                    status: 1,
                    message: 'Login successful',
                    data: {
                        id: user.id,
                        FirstName: user.FirstName,
                        email: user.email,
                        // mobilenumber: user.mobilenumber,
                        token: token,
                    },
                });
            }
            else {
                // If user doesn't exist, create a new user
                const newUser = yield user_1.default.create({
                    email,
                    // fullName,
                    socialId,
                    socialType,
                    // deviceToken,
                    // deviceType,
                });
                // Generate JWT token for the new user
                const token = jsonwebtoken_1.default.sign({ userId: newUser.id, email: newUser.email }, process.env.TOKEN_KEY);
                // Send response back to client for the newly registered user
                return res.json({
                    status: 1,
                    message: 'Registration successful',
                    data: {
                        id: newUser.id,
                        FirstName: newUser.FirstName,
                        email: newUser.email,
                        // mobilenumber: newUser.mobilenumber,
                        token: token,
                    },
                });
            }
        }
        catch (error) {
            console.error('Error during social login:', error);
            // Send error response
            return res.status(500).json({
                status: 0,
                message: 'Internal Server Error',
            });
        }
    }),
    ForgetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = req.body.email;
        try {
            // Step 1: Check if email exists in the database
            const user = yield user_1.default.findOne({
                where: { email: email },
            });
            if (!user) {
                return res.status(400).json({ status: 0, message: 'User not found' });
            }
            // Step 2: Generate OTP (Random token for password reset)
            // Generate a secure 6-digit OTP (reset token)
            const generateResetToken = () => {
                const token = Math.floor(100000 + Math.random() * 900000); // 6 digit number between 100000 and 999999
                return token.toString();
            };
            // Generate expiration time for the token (10 minutes from now)
            const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expiration in 10 minutes
            // Usage example:
            const resetToken = generateResetToken();
            console.log(resetToken, resetExpires);
            yield user.update({
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires, // Correctly passing Date object
            });
            const emailData = {
                companyName: "Your Company Name",
                firstName: user.FirstName,
                action: "reset your password",
                otp: resetToken,
                otpExpiry: "10 minutes",
            };
            const htmlContent = template(emailData);
            // Step 4: Send OTP via email
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail', // Use your email service provider
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                }
            });
            const mailOptions = {
                from: 'tryoutscout@gmail.com',
                to: email,
                subject: 'Password Reset OTP',
                html: htmlContent,
            };
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ status: 0, message: 'Failed to send OTP email' });
                }
                return res.status(200).json({ status: 1, message: 'OTP sent to email successfully' });
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    OtpVerify: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, otp } = req.body;
        console.log(req.body, "BODY");
        if (!otp) {
            return res.json({ status: 0, message: "email and otp required" });
        }
        try {
            // Step 1: Check if the email exists
            const user = yield user_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    status: 0,
                    message: 'User not found',
                });
            }
            // Step 2: Check if the OTP is valid
            const currentTime = new Date();
            if (user.resetPasswordToken !== otp || // OTP mismatch
                !user.resetPasswordExpires || // Expiry not set
                user.resetPasswordExpires < currentTime // OTP expired
            ) {
                return res.status(400).json({
                    status: 0,
                    message: 'Invalid or expired OTP',
                });
            }
            // Step 3: OTP is valid, proceed further (e.g., reset password)
            return res.status(200).json({
                status: 1,
                message: 'OTP verified successfully',
            });
        }
        catch (error) {
            console.error('Error verifying OTP:', error);
            return res.status(500).json({
                status: 0,
                message: 'Internal Server Error',
            });
        }
    }),
    UpdatePassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, newPassword } = req.body;
        try {
            const user = yield user_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    status: 0,
                    message: 'User not found',
                });
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword;
            yield user.save();
            return res.status(200).json({
                status: 1,
                message: "Password updated successfully"
            });
        }
        catch (error) {
            console.error("Error updating password:", error); // Log actual error
            return res.status(500).json(Object.assign({ status: 0, message: 'Internal Server Error' }, (process.env.NODE_ENV === 'development' && { error: error.message })));
        }
    }),
    GetCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield model_1.Category.findAll();
            if (categories.length === 0) {
                return res.status(404).json({ status: 0, message: 'No categories found' });
            }
            return res.status(200).json({ status: 1, message: 'Categories retrieved successfully', categories });
        }
        catch (error) {
            console.error('Error retrieving categories:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetSubcategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const category_id = req.body.category_id;
            console.log(category_id, "category_id");
            const subcategories = yield model_1.SubCategory.findAll({
                where: { category_id: category_id },
            });
            if (subcategories.length === 0) {
                return res.status(404).json({ status: 0, message: 'No subcategories found' });
            }
            res.status(200).json({ status: 1, message: 'Subcategories retrieved successfully', subcategories });
        }
        catch (error) {
            console.error('Error retrieving subcategories:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    CompleteProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const { FirstName, gender, dob } = req.body;
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            console.log(req.body, 'BODY>>>');
            // Parse interests
            let interestArray = [];
            if (req.body.Interests) {
                try {
                    interestArray = JSON.parse(req.body.Interests);
                    if (!Array.isArray(interestArray)) {
                        return res.status(400).json({ message: 'Interests should be a JSON array' });
                    }
                }
                catch (parseError) {
                    return res.status(400).json({ message: 'Invalid format for Interests field' });
                }
            }
            const user = yield user_1.default.findByPk(user_id, {
                attributes: ['id', 'FirstName', 'image', 'dob', 'gender', 'isCompletedProfile'],
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Update user details
            user.FirstName = FirstName !== null && FirstName !== void 0 ? FirstName : user.FirstName;
            user.gender = gender !== null && gender !== void 0 ? gender : user.gender;
            user.dob = dob !== null && dob !== void 0 ? dob : user.dob;
            user.image = image !== null && image !== void 0 ? image : user.image;
            user.isCompletedProfile = true;
            yield user.save();
            // Append new interests without deleting old ones
            if (interestArray.length > 0) {
                // Fetch existing interests
                const existingInterests = yield Interests_1.default.findAll({ where: { userId: user_id } });
                const existingSubcategoryIds = existingInterests.map(i => i.subcategoryId);
                // Filter out only new interests
                const newUniqueInterests = interestArray
                    .filter(subcategoryId => !existingSubcategoryIds.includes(subcategoryId))
                    .map(subcategoryId => ({
                    userId: user_id,
                    subcategoryId,
                }));
                // Insert new interests only
                if (newUniqueInterests.length > 0) {
                    yield Interests_1.default.bulkCreate(newUniqueInterests);
                    console.log('New interests added successfully:', newUniqueInterests);
                }
                else {
                    console.log('No new interests to add.');
                }
            }
            // Send final response
            return res.json({
                status: 1,
                message: 'User updated successfully',
                user: Object.assign({}, user.toJSON()),
            });
        }
        catch (error) {
            console.error('Error completing profile:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const user = yield user_1.default.findOne({
                where: { id: userId },
                attributes: ['id', 'FirstName', 'email', 'dob', 'image'],
                include: [
                    {
                        model: Interests_1.default,
                        as: 'interests',
                        attributes: {
                            exclude: ['createdAt', 'updatedAt']
                        },
                        include: [
                            {
                                model: model_1.SubCategory,
                                as: 'subcategory',
                                include: [
                                    {
                                        model: model_1.Category,
                                        as: 'category',
                                        attributes: {
                                            exclude: ['createdAt', 'updatedAt']
                                        },
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({
                status: 1,
                message: 'Profile retrieved successfully',
                data: user,
            });
        }
        catch (error) {
            console.error('Error retrieving profile:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    AddPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const { Title, GroupSize, Time, Description, Location, subcategoryId, Latitude, Longitude, IsOnRequest, IsAddAutomatically, isTodayOnly, isAvailablenow, ageRangeMax, ageRangeMin, endTime, date } = req.body;
            console.log(req.body, "<<<<<body>>>>");
            if (!date) {
                return res.status(400).json({ message: 'Date is required' });
            }
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            const AddPost = yield post_1.default.create({
                Title,
                GroupSize,
                Time,
                Description,
                Location,
                subcategoryId,
                Latitude,
                Longitude,
                userId,
                image,
                IsAddAutomatically,
                IsOnRequest,
                isTodayOnly,
                isAvailablenow,
                ageRangeMax,
                ageRangeMin,
                endTime,
                date
            });
            console.log(AddPost, "ADD POST");
            // 🔔 Send notification if isAvailablenow is true
            if (isAvailablenow) {
                const postLat = parseFloat(Latitude);
                const postLng = parseFloat(Longitude);
                const distanceKm = 15;
                const distanceFormula = (0, sequelize_1.literal)(`
        6371 * acos(
          cos(radians(${postLat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${postLng})) +
          sin(radians(${postLat})) * sin(radians(latitude))
        )
      `);
                let users = yield user_1.default.findAll({
                    where: {
                        showNowAvailable: true,
                        pushNotification: true,
                        [sequelize_1.Op.and]: model_1.default.where(distanceFormula, { [sequelize_1.Op.lte]: distanceKm })
                    }
                });
                if (users.length === 0) {
                    users = yield user_1.default.findAll({
                        where: {
                            pushNotification: true,
                            [sequelize_1.Op.and]: model_1.default.where(distanceFormula, { [sequelize_1.Op.lte]: distanceKm })
                        }
                    });
                }
                for (const user of users) {
                    yield notificationQueue_1.notificationQueue.add('send-now-available', {
                        userId: user.id,
                        title: 'Available Now!',
                        message: `${Title} is happening near you!`,
                        postId: AddPost.id.toString()
                    });
                }
                console.log(`✅ Notifications sent to ${users.length} users.`);
            }
            // 🕒 Calculate end time for group
            let postEndAt;
            try {
                postEndAt = new Date(new Date(AddPost.date).getTime() + 48 * 60 * 60 * 1000);
            }
            catch (err) {
                return res.status(400).json({ message: 'Invalid date format' });
            }
            // 📌 Create Group
            yield model_1.GroupMember.create({
                createdBy: userId !== null && userId !== void 0 ? userId : '',
                postId: AddPost.id,
                maxSize: GroupSize,
                endAt: postEndAt
            });
            res.status(200).json({
                status: 1,
                message: 'Post added successfully',
                data: AddPost
            });
        }
        catch (error) {
            console.error('Error adding post:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            // User ka latitude aur longitude body se le rahe hain
            const { latitude, longitude } = req.body;
            if (!latitude || !longitude) {
                return res.status(400).json({ message: 'Latitude and Longitude are required' });
            }
            const userLocation = {
                lat: parseFloat(latitude),
                lon: parseFloat(longitude),
            };
            const posts = yield post_1.default.findAll({
                where: { userId },
                include: [
                    {
                        model: model_1.GroupMember,
                        as: 'groupMembers', // ✅ Fixed alias
                        attributes: ['members']
                    }
                ]
            });
            if (posts.length === 0) {
                return res.status(404).json({ status: 0, message: 'No posts found' });
            }
            const result = posts.map((post) => {
                var _a, _b;
                const members = (_b = (_a = post.group) === null || _a === void 0 ? void 0 : _a.members) !== null && _b !== void 0 ? _b : [];
                // Post ki location
                const postLocation = {
                    lat: parseFloat(post.Latitude),
                    lon: parseFloat(post.Longitude),
                };
                // Distance calculate karenge (in meters), then convert to km
                const distanceInMeters = (0, haversine_distance_1.default)(userLocation, postLocation);
                const distanceInKm = +(distanceInMeters / 1000).toFixed(2); // Rounded to 2 decimal places
                return Object.assign(Object.assign({}, post.toJSON()), { joinedCount: members.length, groupSize: post.GroupSize, distanceInKm });
            });
            return res.status(200).json({ status: 1, message: 'Posts retrieved successfully', data: result });
        }
        catch (error) {
            console.error('Error retrieving posts:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    DeletePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const postId = req.body.id; // Assuming you're passing post ID as a URL parameter
            console.log(postId, "POST ID");
            if (!postId) {
                return res.json({ status: 0, message: "Post id is required" });
            }
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            // Find the post to be deleted
            const post = yield post_1.default.findOne({ where: { id: postId, userId } });
            if (!post) {
                return res.status(404).json({ status: 0, message: 'Post not found' });
            }
            yield model_1.GroupMember.destroy({ where: { postId } }); // Delete associated group members  
            // Delete the post
            yield post.destroy();
            return res.status(200).json({ status: 1, message: 'Post deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting post:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    UpdatePost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const postId = req.body.id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const post = yield post_1.default.findOne({ where: { id: postId, userId } });
            if (!post) {
                return res.status(404).json({ status: 0, message: 'Post not found' });
            }
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            const { Title, GroupSize, Time, Description, Location, subcategoryId, Latitude, Longitude, IsOnRequest, IsAddAutomatically, isAvailablenow, isTodayOnly, ageRangeMax, ageRangeMin } = req.body;
            console.log(req.body, "BODY>>>");
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            console.log(image, "IMAGE PATH");
            // Update fields if provided
            post.Title = Title !== null && Title !== void 0 ? Title : post.Title;
            post.GroupSize = GroupSize !== null && GroupSize !== void 0 ? GroupSize : post.GroupSize;
            post.Time = Time !== null && Time !== void 0 ? Time : post.Time;
            post.Description = Description !== null && Description !== void 0 ? Description : post.Description;
            post.Location = Location !== null && Location !== void 0 ? Location : post.Location;
            post.subcategoryId = subcategoryId !== null && subcategoryId !== void 0 ? subcategoryId : post.subcategoryId;
            post.Latitude = Latitude !== null && Latitude !== void 0 ? Latitude : post.Latitude;
            post.Longitude = Longitude !== null && Longitude !== void 0 ? Longitude : post.Longitude;
            post.image = image !== null && image !== void 0 ? image : post.image;
            post.IsOnRequest = IsOnRequest !== null && IsOnRequest !== void 0 ? IsOnRequest : post.IsOnRequest;
            post.IsAddAutomatically = IsAddAutomatically !== null && IsAddAutomatically !== void 0 ? IsAddAutomatically : post.IsAddAutomatically;
            post.isAvailablenow = isAvailablenow !== null && isAvailablenow !== void 0 ? isAvailablenow : post.isAvailablenow;
            post.isTodayOnly = isTodayOnly !== null && isTodayOnly !== void 0 ? isTodayOnly : post.isTodayOnly;
            post.ageRangeMin = ageRangeMin !== null && ageRangeMin !== void 0 ? ageRangeMin : post.ageRangeMin;
            post.ageRangeMax = ageRangeMax !== null && ageRangeMax !== void 0 ? ageRangeMax : post.ageRangeMax;
            yield post.save();
            if ((group === null || group === void 0 ? void 0 : group.members) && Array.isArray(group.members)) {
                for (const member of group.members) {
                    if (member.userId === group.createdBy)
                        continue; // Skip creator
                    const user = yield user_1.default.findOne({ where: { id: member.userId } });
                    if ((user === null || user === void 0 ? void 0 : user.eventUpdate) == true && user.pushNotification == true) {
                        // Create in-app notification
                        yield Notification_1.default.create({
                            userId: user.id,
                            body: 'The host updated the Qes',
                            type: 'eventUpdate',
                            moduleId: post.id.toString(),
                            senderId: group.createdBy,
                            title: 'group update'
                        });
                        // Send push notification
                        yield notificationQueue_1.notificationQueue.add('send-event-update', {
                            userId: user.id,
                            title: 'Group Update',
                            message: 'The host updated the Qes',
                            postId: post.id.toString()
                        });
                    }
                }
            }
            return res.status(200).json({ status: 1, message: 'Post updated successfully', data: post });
        }
        catch (error) {
            console.error('Error updating post:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    JoinGroup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { postId } = req.body;
            const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toString();
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            // Fetch user once
            const user = yield user_1.default.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found' });
            }
            const post = yield post_1.default.findOne({ where: { id: postId } });
            if (!post) {
                return res.status(404).json({ status: 0, message: 'Post not found' });
            }
            const members = group.members;
            const isAlreadyMember = members.some((member) => member.userId === userId);
            if (isAlreadyMember) {
                return res.status(400).json({ status: 0, message: 'Already joined or requested' });
            }
            const isGroupFull = members.length >= group.maxSize;
            if (isGroupFull) {
                return res.status(400).json({ status: 0, message: 'Group is full' });
            }
            const isRequestRequired = Boolean(post.IsOnRequest);
            const memberStatus = isRequestRequired ? 'pending' : 'joined';
            const newMember = { userId, status: memberStatus, isArchive: true };
            const updatedMembers = [...members, newMember];
            yield group.update({ members: updatedMembers });
            const shouldNotify = isRequestRequired && Boolean(post.userId) && Boolean(user.pushNotification);
            if (shouldNotify) {
                yield Notification_1.default.create({
                    moduleId: postId,
                    userId: post.userId,
                    senderId: userId,
                    title: "Join Request",
                    body: `${user.FirstName} wants to be added to the group`,
                });
            }
            yield notificationQueue_1.notificationQueue.add('send-request-to-join', {
                userId: post.userId,
                title: 'Join Request',
                message: `${user.FirstName} wants to be added to the group`,
                postId: post.id.toString()
            });
            return res.status(200).json({
                status: isRequestRequired ? 1 : 2,
                message: isRequestRequired
                    ? 'Request sent to the group admin'
                    : 'Successfully joined the group',
            });
        }
        catch (error) {
            console.error('Join Group Error:', error);
            return res.status(500).json({ status: 0, message: 'Internal server error' });
        }
    }),
    AcceptRequest: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { id, postId, memberId, action } = req.body; // action = 'accept' | 'reject'
            if (!userId || !postId || !memberId || !action) {
                return res.status(400).json({ status: 0, message: 'Missing required fields' });
            }
            const membersData = yield user_1.default.findOne({ where: { id: memberId } });
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found for this post' });
            }
            if (group.createdBy !== userId) {
                return res.status(403).json({ status: 0, message: 'Only the group creator can perform this action' });
            }
            const memberExists = group.members.some((member) => member.userId === memberId && member.status === 'pending');
            console.log(memberExists, "MEMBER EXISTS");
            if (!memberExists) {
                return res.status(404).json({ status: 0, message: 'Pending member not found' });
            }
            let updatedMembers;
            if (action === 'accept') {
                updatedMembers = group.members.map((member) => member.userId === memberId ? Object.assign(Object.assign({}, member), { status: 'joined' }) : member);
            }
            else if (action === 'reject') {
                updatedMembers = group.members.filter((member) => member.userId !== memberId);
            }
            else {
                return res.status(400).json({ status: 0, message: 'Invalid action type' });
            }
            yield group.update({ members: updatedMembers });
            // Step 1: Set old "Join Request" notification isActive = false
            // Step 1: Find the active join request notification
            const existingNotification = yield Notification_1.default.findOne({
                where: {
                    id: id
                }
            });
            // Step 2: If found, set isActive to false and save
            if (existingNotification) {
                existingNotification.isActive = false;
                yield existingNotification.save();
                console.log("Old notification updated with isActive = false");
            }
            else {
                console.log("No active join request notification found");
            }
            // Step 2: Create new notification if push notifications are enabled
            const notificationType = action === 'accept' ? 'Accept Request' : 'Reject Request';
            const notificationTitle = action === 'accept'
                ? 'Group Join Request Accepted'
                : 'Group Join Request Rejected';
            const notificationBody = action === 'accept'
                ? 'Group Admin has added you into the group'
                : 'Your request to join the group has been rejected by the admin';
            if ((membersData === null || membersData === void 0 ? void 0 : membersData.pushNotification) === true) {
                yield Notification_1.default.create({
                    type: notificationType,
                    userId: memberId,
                    senderId: userId,
                    title: notificationTitle,
                    body: notificationBody,
                    moduleId: postId,
                    isActive: true // Important to keep new notification active
                });
                yield notificationQueue_1.notificationQueue.add('send-accept-request', {
                    userId: memberId,
                    title: notificationTitle,
                    message: notificationBody,
                    postId: postId.toString()
                });
            }
            return res.status(200).json({
                status: 1,
                message: `Member request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
                data: {
                    memberId,
                    postId
                }
            });
        }
        catch (error) {
            console.error('Error handling request:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    RemoveFromGroup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { postId, memberId } = req.body;
            console.log(req.body, "BODY");
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const getMember = yield user_1.default.findOne({ where: {
                    id: memberId
                } });
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found for this post' });
            }
            if (group.createdBy !== userId) {
                return res.status(403).json({ status: 0, message: 'Only the group creator can remove members' });
            }
            let members = group.members;
            // Debug: Print current members
            console.log('Before removal, members:', members);
            // Trim ID for safety
            const cleanMemberId = memberId === null || memberId === void 0 ? void 0 : memberId.toString().trim();
            // Remove the member
            members = members.filter((member) => member.userId !== cleanMemberId);
            // Debug: Print members after filter
            console.log('After removal, members:', members);
            yield group.update({ members });
            if ((group === null || group === void 0 ? void 0 : group.members) && Array.isArray(group.members)) {
                for (const member of group.members) {
                    const user = yield user_1.default.findOne({ where: { id: member.userId } });
                    if ((user === null || user === void 0 ? void 0 : user.id) !== userId && (user === null || user === void 0 ? void 0 : user.eventUpdate)) {
                        yield Notification_1.default.create({
                            userId: user.id,
                            body: `Host has removed ${getMember === null || getMember === void 0 ? void 0 : getMember.FirstName} from the group`,
                            type: 'eventUpdate',
                            moduleId: postId,
                            senderId: group.createdBy,
                            title: "group update"
                        });
                    }
                }
            }
            return res.status(200).json({ status: 1, message: 'Member removed successfully' });
        }
        catch (error) {
            console.error('Error removing from group:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    LeftFromGroup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { postId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found for this post' });
            }
            let members = group.members;
            const users = yield user_1.default.findOne({ where: {
                    id: userId
                } });
            console.log('Before removal, members:', members);
            const cleanUserId = userId === null || userId === void 0 ? void 0 : userId.toString().trim();
            members = members.filter((member) => member.userId !== cleanUserId);
            console.log('After removal, members:', members);
            yield group.update({ members });
            if ((group === null || group === void 0 ? void 0 : group.members) && Array.isArray(group.members)) {
                for (const member of group.members) {
                    const user = yield user_1.default.findOne({ where: { id: member.userId } });
                    if ((user === null || user === void 0 ? void 0 : user.id) !== userId && (user === null || user === void 0 ? void 0 : user.eventUpdate)) {
                        yield Notification_1.default.create({
                            userId: user.id,
                            body: `${users === null || users === void 0 ? void 0 : users.FirstName} has left the group`,
                            type: 'eventUpdate',
                            moduleId: postId,
                            senderId: group.createdBy,
                            title: "group update"
                        });
                    }
                }
            }
            return res.status(200).json({ status: 1, message: 'Left group successfully' });
        }
        catch (error) {
            console.error('Error leaving group:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    ReportMember: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { postId, memberId, reason } = req.body; // Assuming you're passing post ID and member ID as request body
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            // Find the group associated with the post
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found for this post' });
            }
            console.log(group, "GROUP");
            const memberIds = group.members.map(m => m.userId); // adjust based on your structure
            if (!memberIds.includes(memberId)) {
                return res.status(404).json({ status: 0, message: 'Member not found in the group' });
            }
            console.log(memberId, "MEMBER ID");
            yield Report_1.default.create({
                reporterId: userId,
                reportedId: memberId,
                groupId: group.id,
                postId: postId,
                reason: reason
            });
            // Logic to report the member (e.g., save to database, notify admin, etc.)
            // For now, just return success response
            return res.status(200).json({ status: 1, message: 'Member reported successfully' });
        }
        catch (error) {
            console.error('Error reporting member:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    AddcustomerService: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { email, FirstName, phoneNumber, subject, Description } = req.body;
        try {
            if (!email || !FirstName || !subject) {
                return res.status(400).json({ status: 0, message: 'All input is required' });
            }
            yield customerService_1.default.create({
                userId,
                email,
                name: FirstName,
                phoneNumber,
                subject,
                Description
            });
            return res.status(200).json({
                status: 1,
                message: 'Customer service request added successfully'
            });
        }
        catch (error) {
            console.error('AddcustomerService Error:', {
                message: error.message,
                stack: error.stack,
                details: error
            });
            // Optional: respond differently based on the environment
            const isDevelopment = process.env.NODE_ENV === 'development';
            return res.status(500).json(Object.assign({ status: 0, message: 'Internal Server Error' }, (isDevelopment && { error: error.message })));
        }
    }),
    HomePage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            console.log(userId, "USER");
            const Users = yield user_1.default.findOne({ where: { id: userId } });
            if (!Users) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            const { latitude, longitude } = req.body;
            console.log(req.body, "BODY");
            if (!userId || !latitude || !longitude) {
                return res.status(400).json({ message: 'User ID or location is missing' });
            }
            const today = new Date().toISOString().split('T')[0];
            console.log(today, "TODAY");
            // Build age range condition only if user has valid age ranges
            const ageRangeCondition = (Users.ageRangeMin !== null && Users.ageRangeMax !== null)
                ? model_1.default.literal(`
          (${Users.ageRangeMin} <= "Post"."ageRangeMax" AND ${Users.ageRangeMax} >= "Post"."ageRangeMin")
        `)
                : model_1.default.literal('TRUE');
            const posts = yield post_1.default.findAll({
                where: {
                    userId: { [sequelize_1.Op.ne]: userId },
                    date: today,
                    [sequelize_1.Op.and]: [
                        // Distance filter with proper casting
                        model_1.default.literal(`
            (
              6371 * acos(
                cos(radians(${parseFloat(latitude)})) * cos(radians(CAST("Post"."Latitude" AS FLOAT))) *
                cos(radians(CAST("Post"."Longitude" AS FLOAT)) - radians(${parseFloat(longitude)})) +
                sin(radians(${parseFloat(latitude)})) * sin(radians(CAST("Post"."Latitude" AS FLOAT)))
              )
            ) <= 15
          `),
                        // Age range filter
                        ageRangeCondition,
                    ],
                },
                attributes: [
                    'id', 'Title', 'GroupSize', 'Location', 'Time', 'image', 'ageRangeMin', 'ageRangeMax', 'isAvailablenow',
                    // Distance calculation with proper casting
                    [model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${parseFloat(latitude)})) * cos(radians(CAST("Post"."Latitude" AS FLOAT))) *
              cos(radians(CAST("Post"."Longitude" AS FLOAT)) - radians(${parseFloat(longitude)})) +
              sin(radians(${parseFloat(latitude)})) * sin(radians(CAST("Post"."Latitude" AS FLOAT)))
            )
          )
        `), 'distance']
                ],
                include: [
                    {
                        model: model_1.GroupMember,
                        as: 'groupMembers',
                        where: {
                            endAt: { [sequelize_1.Op.gte]: new Date(today) }
                        },
                        required: true,
                        attributes: ['members', 'endAt'],
                    },
                    {
                        model: user_1.default,
                        as: 'user',
                        attributes: ['id', 'FirstName', 'image', 'showNowAvailable'],
                    },
                ],
                order: [
                    ['isAvailablenow', 'DESC'],
                    // Distance ordering with proper casting
                    [model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${parseFloat(latitude)})) * cos(radians(CAST("Post"."Latitude" AS FLOAT))) *
              cos(radians(CAST("Post"."Longitude" AS FLOAT)) - radians(${parseFloat(longitude)})) +
              sin(radians(${parseFloat(latitude)})) * sin(radians(CAST("Post"."Latitude" AS FLOAT)))
            )
          )
        `), 'ASC']
                ]
            });
            const result = posts.map((post) => {
                var _a;
                const groupMemberEntries = (_a = post.groupMembers) !== null && _a !== void 0 ? _a : [];
                let isJoined = 1;
                let joinedCount = 0;
                groupMemberEntries.forEach((gm) => {
                    if (Array.isArray(gm.members)) {
                        gm.members.forEach((m) => {
                            if (m.userId === String(userId)) {
                                if (m.status === 'pending') {
                                    isJoined = 3;
                                }
                                else {
                                    isJoined = 2;
                                }
                            }
                            joinedCount++;
                        });
                    }
                });
                // Safely handle distance calculation
                const distanceValue = post.get('distance');
                const distance = distanceValue ? parseFloat(distanceValue).toFixed(1) : '0.0';
                return {
                    id: post.id,
                    Title: post.Title,
                    GroupSize: post.GroupSize,
                    Location: post.Location,
                    Time: post.Time,
                    image: post.image,
                    ageRangeMin: post.ageRangeMin,
                    ageRangeMax: post.ageRangeMax,
                    isAvailablenow: post.isAvailablenow,
                    distance: `${distance} km`,
                    isJoined,
                    joinedCount,
                    groupSize: post.GroupSize,
                    user: post.user,
                };
            });
            return res.status(200).json({ status: 1, message: 'Posts retrieved successfully', data: result });
        }
        catch (error) {
            console.error('Error retrieving posts:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    PostDetails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { latitude, longitude, id } = req.body;
            const posts = yield post_1.default.findAll({
                where: {
                    id: id,
                    [sequelize_1.Op.and]: model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(CAST("Post"."Latitude" AS DECIMAL))) *
              cos(radians(CAST("Post"."Longitude" AS DECIMAL)) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(CAST("Post"."Latitude" AS DECIMAL)))
            )
          ) <= 50
        `),
                },
                attributes: [
                    'id', 'Title', 'GroupSize', 'Location', 'Time', 'image', 'Description', 'date',
                    [model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(CAST("Post"."Latitude" AS DECIMAL))) *
              cos(radians(CAST("Post"."Longitude" AS DECIMAL)) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(CAST("Post"."Latitude" AS DECIMAL)))
            )
          )
        `), 'distance'],
                ],
                include: [
                    {
                        model: model_1.GroupMember,
                        as: 'groupMembers',
                        attributes: ['members'],
                    },
                    {
                        model: user_1.default,
                        as: 'user',
                        attributes: ['id', 'FirstName', 'image', 'showNowAvailable'],
                    },
                ],
                order: model_1.default.literal('distance ASC'),
            });
            const result = posts.map((post) => {
                var _a;
                let members = (_a = post.groupMembers) === null || _a === void 0 ? void 0 : _a.map((gm) => gm.members).flat();
                if (typeof members === 'string') {
                    try {
                        members = JSON.parse(members);
                    }
                    catch (_b) {
                        members = [];
                    }
                }
                members = Array.isArray(members) ? members : [];
                let isJoined = 1; // default: not joined
                for (const member of members) {
                    if (member.userId === userId) {
                        isJoined = member.status === 'pending' ? 3 : 2;
                        break;
                    }
                }
                return {
                    id: post.id,
                    Title: post.Title,
                    GroupSize: post.GroupSize,
                    Location: post.Location,
                    Time: post.Time,
                    date: post.date,
                    image: post.image,
                    Description: post.Description,
                    distance: `${parseFloat(post.get('distance')).toFixed(1)} km`,
                    isJoined,
                    joinedCount: members.length,
                    groupSize: post.GroupSize,
                    user: post.user,
                };
            });
            return res.status(200).json({ status: 1, message: "Post detail Fetched", data: result });
        }
        catch (error) {
            console.error("Post details Error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }),
    MapData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const UserRangeinKm = yield user_1.default.findOne({
                where: { id: userId }
            });
            if (!UserRangeinKm) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            const { latitude, longitude } = req.body;
            const range = (UserRangeinKm === null || UserRangeinKm === void 0 ? void 0 : UserRangeinKm.maxDistanceKm) || 15;
            if (!latitude || !longitude) {
                return res.status(400).json({ status: 0, message: 'Latitude and longitude are required' });
            }
            const lat = Number(latitude);
            const lng = Number(longitude);
            const rangeNum = Number(range);
            const posts = yield post_1.default.findAll({
                where: {
                    userId: { [sequelize_1.Op.ne]: userId },
                    [sequelize_1.Op.and]: model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(CAST("Post"."Latitude" AS FLOAT))) *
              cos(radians(CAST("Post"."Longitude" AS FLOAT)) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(CAST("Post"."Latitude" AS FLOAT)))
            )
          ) <= ${rangeNum}
        `)
                },
                attributes: [
                    'id', 'Title', 'Location', 'image', 'Latitude', 'Longitude',
                    [model_1.default.literal(`
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(CAST("Post"."Latitude" AS FLOAT))) *
              cos(radians(CAST("Post"."Longitude" AS FLOAT)) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(CAST("Post"."Latitude" AS FLOAT)))
            )
          )
        `), 'distance']
                ],
                include: [
                    {
                        model: model_1.GroupMember,
                        as: 'groupMembers',
                        required: false,
                        attributes: ['members'],
                    }
                ],
                order: [[model_1.default.literal('distance'), 'ASC']],
            });
            const result = posts.map((post) => {
                var _a;
                const groupMemberEntries = (_a = post.groupMembers) !== null && _a !== void 0 ? _a : [];
                let isJoined = false;
                let joinedCount = 0;
                groupMemberEntries.forEach((gm) => {
                    if (Array.isArray(gm.members)) {
                        gm.members.forEach((m) => {
                            if (m.userId === String(userId)) {
                                isJoined = true;
                            }
                            joinedCount++;
                        });
                    }
                });
                const distanceValue = post.get('distance');
                const distance = distanceValue ? parseFloat(distanceValue).toFixed(1) : '0.0';
                return {
                    id: post.id,
                    Title: post.Title,
                    Location: post.Location,
                    image: post.image,
                    latitude: post.Latitude,
                    longitude: post.Longitude,
                    distance: `${distance} km`,
                    isJoined,
                    joinedCount,
                    groupSize: post.GroupSize,
                };
            });
            return res.json({
                status: 1,
                message: "Nearby posts fetched successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("MapData Error:", error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    postGroupDetails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.body.id;
            console.log(id, "id");
            const postGroupDetails = yield post_1.default.findAll({
                where: { id },
                include: [
                    {
                        model: model_1.GroupMember,
                        as: 'group',
                        attributes: ['members'],
                    },
                    {
                        model: user_1.default,
                        as: 'user',
                        attributes: ['id', 'FirstName', 'image'],
                    },
                ],
            });
            console.log(postGroupDetails, "POST DETAILS");
            res.json({ status: 1, message: "Group details Fetched", data: postGroupDetails });
        }
        catch (error) {
            console.error("Error fetching group details:", error);
            res.status(500).json({ status: 0, message: "Internal Server Error" });
        }
    }),
    GetSettingNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(400).json({ status: 0, message: 'User ID is missing or invalid' });
            }
            const userSettings = yield user_1.default.findOne({
                where: { id: userId },
                attributes: [
                    'id',
                    'reportNotification',
                    'inAppVibration',
                    'inAppSound',
                    'latitude',
                    'longitude',
                    'minDistanceKm',
                    'maxDistanceKm',
                    'ageRangeMin',
                    'ageRangeMax',
                    'pushNotification',
                    'eventUpdate',
                    'memories',
                    "showNowAvailable",
                ]
            });
            if (!userSettings) {
                return res.status(404).json({ status: 0, message: 'User settings not found' });
            }
            return res.json({
                status: 1,
                message: 'Notification settings retrieved successfully',
                data: userSettings
            });
        }
        catch (error) {
            console.error('GetSettingNotification Error:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    UpdateSettingNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Extract user ID from the request object (assuming authenticated user)
            const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Validate if user ID is provided
            if (!id) {
                return res.status(400).json({ status: 0, message: 'User ID is missing or invalid' });
            }
            // Destructure request body
            const { reportNotification, inAppVibration, inAppSound, latitude, showNowAvailable, longitude, minDistanceKm, maxDistanceKm, ageRangeMin, ageRangeMax, pushNotification, eventUpdate, memories, } = req.body;
            console.log(req.body, "BODY");
            // Find the user by primary key (id)
            let user = yield user_1.default.findByPk(id);
            // If user is not found, return a 404 error
            if (!user) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            // Update user settings using nullish coalescing (??) to keep existing values if not provided
            user.reportNotification = reportNotification !== null && reportNotification !== void 0 ? reportNotification : user.reportNotification;
            user.inAppVibration = inAppVibration !== null && inAppVibration !== void 0 ? inAppVibration : user.inAppVibration;
            user.inAppSound = inAppSound !== null && inAppSound !== void 0 ? inAppSound : user.inAppSound;
            user.latitude = latitude !== null && latitude !== void 0 ? latitude : user.latitude;
            user.longitude = longitude !== null && longitude !== void 0 ? longitude : user.longitude;
            user.maxDistanceKm = maxDistanceKm !== null && maxDistanceKm !== void 0 ? maxDistanceKm : user.maxDistanceKm;
            user.minDistanceKm = minDistanceKm !== null && minDistanceKm !== void 0 ? minDistanceKm : user.minDistanceKm;
            user.ageRangeMax = ageRangeMax !== null && ageRangeMax !== void 0 ? ageRangeMax : user.ageRangeMax;
            user.ageRangeMin = ageRangeMin !== null && ageRangeMin !== void 0 ? ageRangeMin : user.ageRangeMin;
            user.pushNotification = pushNotification !== null && pushNotification !== void 0 ? pushNotification : user.pushNotification;
            user.eventUpdate = eventUpdate !== null && eventUpdate !== void 0 ? eventUpdate : user.eventUpdate;
            user.memories = memories !== null && memories !== void 0 ? memories : user.memories;
            user.showNowAvailable = showNowAvailable !== null && showNowAvailable !== void 0 ? showNowAvailable : user.showNowAvailable;
            // Save updated user settings
            yield user.save();
            console.log(user, "USER");
            // Return success response
            res.json({ status: 1, message: 'Notification settings updated successfully' });
        }
        catch (error) {
            // Log the error for debugging
            console.error('Error updating notification settings:', error);
            // Return a generic error message, while sending the error message to logs
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Pehle saare notifications la lo
            const notifications = yield Notification_1.default.findAll({
                where: {
                    userId: userId,
                    isActive: true //
                },
                order: [['createdAt', 'DESC']] // Add this line
            });
            const updatedNotifications = yield Promise.all(notifications.map((notification) => __awaiter(void 0, void 0, void 0, function* () {
                // Sender ki detail lao
                const sender = yield user_1.default.findOne({
                    where: { id: notification.senderId },
                    attributes: ['image', 'FirstName']
                });
                return Object.assign(Object.assign({}, notification.toJSON()), { senderImage: (sender === null || sender === void 0 ? void 0 : sender.image) || null, senderName: (sender === null || sender === void 0 ? void 0 : sender.FirstName) || null });
            })));
            res.json({ status: 1, message: "Notification fetched successfully", data: updatedNotifications });
        }
        catch (error) {
            console.error('Error getting notifications:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetAllSubcategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const GetAllSubcategory = yield model_1.SubCategory.findAll({ attributes: ['id', 'Name', 'image', 'category_id'] });
            res.json({ status: 1, message: "subcategory get successfully", data: GetAllSubcategory });
        }
        catch (error) {
            console.error('Error updating notification settings:', error);
            // Return a generic error message, while sending the error message to logs
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    GetMyProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(400).json({ status: 0, message: 'User ID not found' });
            }
            // Get User basic data
            const user = yield user_1.default.findOne({
                where: { id: userId },
                attributes: ['FirstName', 'email', 'image', 'dob']
            });
            if (!user) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
            // Get all user interests (subcategoryId)
            const userInterests = yield Interests_1.default.findAll({
                where: { userId },
                attributes: ['subcategoryId']
            });
            const subcategoryIds = userInterests.map((interest) => interest.subcategoryId);
            if (subcategoryIds.length === 0) {
                return res.status(200).json({
                    status: 1,
                    data: {
                        firstName: user.FirstName,
                        email: user.email,
                        profileImage: user.image,
                        dateOfBirth: user.dob,
                        interests: []
                    }
                });
            }
            // Fetch Subcategories along with their Categories
            const subcategories = yield model_1.SubCategory.findAll({
                where: { id: subcategoryIds },
                include: [
                    {
                        model: model_1.Category,
                        as: 'Category', // IMPORTANT: use alias if association has alias
                        attributes: ['id', 'Name']
                    }
                ],
                attributes: ['id', 'Name', 'image', 'category_id']
            });
            // Organize by category
            const interestsMap = {};
            subcategories.forEach((subcat) => {
                var _a;
                const categoryId = subcat.category_id;
                const categoryName = ((_a = subcat.Category) === null || _a === void 0 ? void 0 : _a.Name) || '';
                if (!interestsMap[categoryId]) {
                    interestsMap[categoryId] = {
                        categoryId,
                        categoryName,
                        subcategories: []
                    };
                }
                interestsMap[categoryId].subcategories.push({
                    subcategoryId: subcat.id,
                    name: subcat.Name,
                    image: subcat.image
                });
            });
            const interestsArray = Object.values(interestsMap);
            // Final response
            return res.status(200).json({
                status: 1,
                data: {
                    firstName: user.FirstName,
                    email: user.email,
                    profileImage: user.image,
                    dateOfBirth: user.dob,
                    interests: interestsArray
                }
            });
        }
        catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    CancelPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const postId = req.body.id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
            // Find the post
            const post = yield post_1.default.findOne({ where: { id: postId } });
            if (!post) {
                return res.status(404).json({ status: 0, message: 'Post not found' });
            }
            // Find the associated group
            const group = yield model_1.GroupMember.findOne({ where: { postId } });
            if (!group) {
                return res.status(404).json({ status: 0, message: 'Group not found for this post' });
            }
            // Only group creator can cancel
            if (group.createdBy !== userId) {
                return res.status(403).json({ status: 0, message: 'Only the group creator can cancel the post' });
            }
            // Notify group members
            if (Array.isArray(group.members)) {
                for (const member of group.members) {
                    const user = yield user_1.default.findOne({ where: { id: member.userId } });
                    if (!user)
                        continue; // Skip if user not found
                    // Send notification (excluding self if desired)
                    const sendPushNotification = yield Notification_1.default.create({
                        userId: user.id,
                        body: 'The host cancelled the Qes',
                        type: 'eventUpdate',
                        moduleId: post.id.toString(),
                        senderId: group.createdBy,
                        title: 'Group Update',
                    });
                    console.log(sendPushNotification, "SEND PUSH NOTIFICATION");
                    // Optional: Push notification logic
                    // await sendPushNotification(user.deviceToken, 'The host cancelled the Qes');
                }
            }
            // Delete the post and group
            yield post.destroy();
            yield group.destroy();
            return res.status(200).json({ status: 1, message: 'Post cancelled successfully' });
        }
        catch (error) {
            console.error('Error cancelling post:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    ArchiveGroup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // End of today to include today in comparison
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            // Fetch expired groups with the associated post
            const expiredGroups = yield model_1.GroupMember.findAll({
                where: {
                    endAt: {
                        [sequelize_1.Op.lte]: endOfToday, // Group's end date is today or before
                    },
                },
                include: [
                    {
                        model: post_1.default,
                        as: 'post', // Make sure the alias matches
                        required: true, // Ensures you only get groups with associated posts
                    },
                ],
            });
            console.log(expiredGroups, "<<<<<EXPIRES>>>>");
            res.status(200).json({ status: 1, messaege: "Archive Group get succesfully", data: expiredGroups });
        }
        catch (error) {
            console.error('Error fetching archived groups:', error);
            res.status(500).json({ status: 0, message: 'Something went wrong' });
        }
    }),
    RecreateGroupFromArchive: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.json({ status: 0, message: "User not found" });
            }
            const { oldPostId, Title, GroupSize, Time, Description, Location, subcategoryId, Latitude, Longitude, IsOnRequest, IsAddAutomatically, isTodayOnly, isAvailablenow, ageRangeMax, ageRangeMin, endTime, date } = req.body;
            if (!oldPostId || !date) {
                return res.status(400).json({ status: 0, message: 'oldPostId and date are required' });
            }
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
            // 1. Get old group for members
            const oldGroup = yield model_1.GroupMember.findOne({ where: { postId: oldPostId } });
            if (!oldGroup) {
                return res.status(404).json({ status: 0, message: 'Archived group not found' });
            }
            // 2. Create new post
            const newPost = yield post_1.default.create({
                Title,
                GroupSize,
                Time,
                Description,
                Location,
                subcategoryId,
                Latitude,
                Longitude,
                userId,
                IsOnRequest,
                IsAddAutomatically,
                isTodayOnly,
                isAvailablenow,
                ageRangeMax,
                ageRangeMin,
                endTime,
                date,
                image
            });
            // 3. Calculate endAt (48 hours after post date)
            const endAt = new Date(new Date(date).getTime() + 48 * 60 * 60 * 1000);
            // 4. Filter members with status 'joined'
            const joinedMembers = oldGroup.members.filter((member) => member.status === 'joined');
            const joinedUserIds = joinedMembers.map((member) => member.userId);
            // 5. Create new group with only joined members
            const newGroup = yield model_1.GroupMember.create({
                createdBy: userId,
                postId: newPost.id,
                maxSize: GroupSize,
                endAt,
                members: joinedMembers
            });
            // 6. Send response with simplified members
            res.status(200).json({
                status: 1,
                message: 'New post and group created with same members',
                data: {
                    newPost,
                    newGroup: Object.assign(Object.assign({}, newGroup.toJSON()), { members: joinedUserIds })
                }
            });
        }
        catch (error) {
            console.error('Error recreating group:', error);
            res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    DeleteInterests: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const subcategoryId = req.body.subcategoryId;
            if (!userId || !subcategoryId) {
                return res.status(400).json({ status: 0, message: 'User ID or subcategory ID is missing' });
            }
            // Check if the interest exists
            const interest = yield Interests_1.default.findOne({
                where: { userId, subcategoryId }
            });
            if (!interest) {
                return res.status(404).json({ status: 0, message: 'Interest not found' });
            }
            // Delete the interest
            yield interest.destroy();
            return res.status(200).json({ status: 1, message: 'Interest deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting interests:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    }),
    RecentQess: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { latitude, longitude } = req.body;
            if (!userId || latitude === undefined || longitude === undefined) {
                return res.status(400).json({ status: 0, message: 'User ID or location is missing' });
            }
            // GroupMember logic same as before
            const groupMemberRecords = yield model_1.GroupMember.findAll({
                order: [['createdAt', 'DESC']],
                attributes: ['postId', 'members'],
                limit: 1
            });
            const joinedPostIds = [];
            for (const record of groupMemberRecords) {
                const members = record.members || [];
                const matchedMember = members.find((m) => m.userId === userId && m.status === 'joined' && m.isArchive === false);
                if (matchedMember) {
                    joinedPostIds.push(record.postId);
                }
            }
            // ✅ Step 1: Get posts (without association)
            const recentQes = yield post_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { userId },
                        { id: { [sequelize_1.Op.in]: joinedPostIds } }
                    ]
                },
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'Title', 'GroupSize', 'Location', 'Time', 'image', 'date', 'Latitude', 'Longitude', 'userId']
            });
            if (recentQes.length === 0) {
                return res.status(404).json({ status: 0, message: 'No recent Qes found' });
            }
            // ✅ Step 2: Get all userIds from posts
            const userIds = [...new Set(recentQes.map(post => post.userId))];
            // ✅ Step 3: Get users and build a map
            const users = yield user_1.default.findAll({
                where: { id: { [sequelize_1.Op.in]: userIds } },
                attributes: ['id', 'image']
            });
            const userImageMap = {};
            users.forEach(user => {
                userImageMap[user.id] = user.image;
            });
            // ✅ Step 4: Enrich post data
            const enrichedQes = recentQes.map(post => {
                const distanceInKm = getDistanceFromLatLonInKm(latitude, longitude, Number(post.Latitude), Number(post.Longitude));
                // Find related group members for this post
                const gmEntry = groupMemberRecords.find(gm => gm.postId === post.id);
                let isJoined = 1; // 1 = not joined, 2 = joined, 3 = pending
                let joinedCount = 0;
                if (gmEntry && Array.isArray(gmEntry.members)) {
                    gmEntry.members.forEach((m) => {
                        if (m.status === 'joined') {
                            joinedCount++;
                        }
                        if (m.userId === String(userId)) {
                            if (m.status === 'pending') {
                                isJoined = 3;
                            }
                            else if (m.status === 'joined') {
                                isJoined = 2;
                            }
                        }
                    });
                }
                return Object.assign(Object.assign({}, post.toJSON()), { distanceInKm, creatorImage: userImageMap[post.userId] || null, isJoined,
                    joinedCount });
            });
            return res.status(200).json({
                status: 1,
                message: 'Recent Qes fetched successfully',
                data: enrichedQes[0] || null // single object
            });
        }
        catch (error) {
            console.error('Error fetching recent Qes:', error);
            return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        }
    })
};
