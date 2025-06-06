"use strict";
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
const auth_1 = __importDefault(require("../models/auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const category_1 = __importDefault(require("../models/category"));
const sequelize_1 = require("sequelize");
const subcategory_1 = __importDefault(require("../models/subcategory"));
const index_1 = require("../../model/index");
const Report_1 = __importDefault(require("../../User/models/Report"));
const customerService_1 = __importDefault(require("../../User/models/customerService"));
const templatePath = path_1.default.join(__dirname, '../../views/otptemplate.hbs');
const source = fs_1.default.readFileSync(templatePath, 'utf-8');
const template = handlebars_1.default.compile(source);
exports.default = {
    AdminLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            // Validate user input
            if (!(email && password)) {
                return res
                    .status(400)
                    .json({ status: 0, message: "All input is required." });
            }
            // Find user by email
            const user = yield auth_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ status: 0, message: "Invalid Email" });
            }
            // Compare the provided password with the stored hashed password
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ status: 0, message: "Invalid Password" });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobilenumber: user.mobilenumber,
            }, process.env.TOKEN_KEY);
            // Respond with user data and the generated token
            return res.status(200).json({
                status: 1,
                message: "Login successful",
                data: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    mobilenumber: user.mobilenumber,
                    image: user.image,
                    token: token,
                },
            });
        }
        catch (error) {
            // Handle unexpected errors
            console.error(error);
            return res
                .status(500)
                .json({ status: 0, message: "Internal server error" });
        }
    }),
    GetAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log();
        const getAdmin = yield auth_1.default.findAll({
            where: {
                id: user_id,
            },
        });
        res.json({
            status: 1,
            message: "Admin profile get succesfully",
            data: getAdmin,
        });
    }),
    UpdateAdmin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Get user_id from the request
            const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!user_id) {
                return res
                    .status(400)
                    .json({ message: "User ID is missing or invalid" });
            }
            // Get the updated user data from the request body
            const { fullName, email, mobilenumber } = req.body;
            const image = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path; // Normalize path
            // Validate required fields
            // Assuming you're using Mongoose to interact with your database
            // You can modify this to use Sequelize or your specific ORM
            let user = yield auth_1.default.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // Update the user's information
            user.fullName = fullName !== null && fullName !== void 0 ? fullName : user.fullName;
            user.email = email !== null && email !== void 0 ? email : user.email;
            user.mobilenumber = mobilenumber !== null && mobilenumber !== void 0 ? mobilenumber : user.mobilenumber;
            user.image = image !== null && image !== void 0 ? image : user.image;
            yield user.save();
            // Return success response with the updated user data
            res.status(200).json({ message: "User updated successfully", user });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }),
    ChangePass: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res
                    .status(400)
                    .json({ status: 0, message: "Old and new passwords are required" });
            }
            if (oldPassword === newPassword) {
                return res
                    .status(400)
                    .json({
                    status: 0,
                    message: "New password cannot be the same as the old password",
                });
            }
            const user = yield auth_1.default.findByPk((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            console.log(user, "USER GET");
            if (!user) {
                return res.status(404).json({ status: 0, message: "User not found" });
            }
            const isValidPassword = yield bcrypt_1.default.compare(oldPassword, user.password); // Ensure 'user.password' is a string
            if (!isValidPassword) {
                return res
                    .status(400)
                    .json({ status: 0, message: "Invalid old password" });
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
            yield user.save();
            return res
                .status(200)
                .json({ status: 1, message: "Password changed successfully" });
        }
        catch (err) {
            console.error("Error:", err.message);
            return res
                .status(500)
                .json({ status: 0, message: "Failed to change password" });
        }
    }),
    ForgetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = req.body.email;
        try {
            // Step 1: Check if email exists in the database
            const user = yield auth_1.default.findOne({
                where: { email: email },
            });
            if (!user) {
                return res.status(400).json({ status: 0, message: 'Please enter a valid email' });
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
                firstName: user.fullName,
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
                    return res.status(500).json({ status: 0, message: 'Error sending OTP' });
                }
                return res.status(200).json({ status: 1, message: 'OTP sent successfully' });
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: 0, message: 'Internal server error' });
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
            const user = yield auth_1.default.findOne({ where: { email } });
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
            const user = yield auth_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({
                    status: 0,
                    message: 'User not found',
                });
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword;
            yield user.save();
            return res.status(200).json({ status: 1, message: "Password updated successfully" });
        }
        catch (error) {
            console.error("Error updating password:", error); // Log the actual error
            return res.status(500).json({
                status: 0,
                message: 'Internal Server Error',
            });
        }
    }),
    AddCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const Name = req.body.Name;
            const Addcat = yield category_1.default.create({
                Name
            });
            res.json({ status: 1, message: "category Add Successfully", data: Addcat });
        }
        catch (error) {
            console.error('Failed to update User:', error);
            res.status(500).json({ status: 0, message: 'Failed to add  category' });
        }
    }),
    GetCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Extract and parse pagination and search parameters
            const { search = '', pageSize = 10 } = req.body;
            let page = search ? 1 : parseInt(req.body.page, 10) || 1;
            // Parse pageSize as a number
            const pageSizeNum = parseInt(pageSize, 10);
            // Calculate offset for pagination
            const offset = (page - 1) * pageSizeNum;
            // Query categories with pagination and search
            const { rows: categories, count: totalCount } = yield category_1.default.findAndCountAll({
                attributes: ['id', 'Name'], // Select specific fields
                where: search
                    ? {
                        Name: {
                            [sequelize_1.Op.like]: `%${search}%`, // Case-insensitive partial match
                        },
                    }
                    : undefined,
                limit: pageSizeNum,
                offset,
            });
            // Calculate total pages
            const totalPages = Math.ceil(totalCount / pageSizeNum);
            // Send the response with metadata
            res.json({
                status: 1,
                message: 'Categories fetched successfully',
                data: categories,
                pagination: {
                    totalPages: totalPages,
                    currentPage: page,
                    pageSize: pageSizeNum,
                }
            });
        }
        catch (error) {
            console.error('Failed to fetch categories:', error);
            res.status(500).json({ status: 0, message: 'Failed to fetch categories' });
        }
    }),
    AddSubCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { Name, category_id } = req.body;
            console.log(req.body, "BODY");
            const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            const Addsubcat = yield subcategory_1.default.create({
                Name,
                category_id,
                image
            });
            res.json({ status: 1, message: "subcategory Add Successfully", data: Addsubcat });
        }
        catch (error) {
            console.error('Failed to update User:', error);
            res.status(500).json({ status: 0, message: 'Failed to add  subcategory' });
        }
    }),
    UpdateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id, Name } = req.body;
            const existingCategory = yield category_1.default.findByPk(id);
            if (!existingCategory) {
                return res.status(404).json({ status: 0, message: 'Category not found' });
            }
            // Update the category
            const updatedCategory = yield existingCategory.update({
                Name: Name !== null && Name !== void 0 ? Name : existingCategory.Name,
            });
            res.json({
                status: 1,
                message: "Category updated successfully",
                data: updatedCategory,
            });
        }
        catch (error) {
            console.error('Failed to update category:', error);
            res.status(500).json({ status: 0, message: 'Failed to update category' });
        }
    }),
    DeleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.body;
            const deletedCount = yield category_1.default.destroy({ where: { id } });
            if (deletedCount === 0) {
                return res.status(404).json({
                    status: 0,
                    message: "Category not found or already deleted",
                });
            }
            return res.status(200).json({
                status: 1,
                message: "Category deleted successfully",
            });
        }
        catch (error) {
            console.error("Error deleting category:", error); // Log for debugging
            return res.status(500).json(Object.assign({ status: 0, message: 'Failed to delete category' }, (process.env.NODE_ENV === 'development' && { error: error.message })));
        }
    }),
    GetSubCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Extract and parse pagination and search parameters
            const { search = '', pageSize = 10 } = req.body;
            let page = search ? 1 : parseInt(req.body.page, 10) || 1;
            // Parse pageSize as a number
            const pageSizeNum = parseInt(pageSize, 10);
            // Calculate offset for pagination
            const offset = (page - 1) * pageSizeNum;
            // Query subcategories with pagination and search
            const { rows: subcategories, count: totalCount } = yield subcategory_1.default.findAndCountAll({
                attributes: ['id', 'Name', 'category_id', 'image'], // Select specific fields from subcategory
                where: search
                    ? {
                        Name: {
                            [sequelize_1.Op.like]: `%${search}%`, // Case-insensitive partial match
                        },
                    }
                    : undefined,
                limit: pageSizeNum,
                offset,
            });
            // Extract all unique category_ids from subcategories
            const categoryIds = [...new Set(subcategories.map((sub) => sub.category_id))];
            // Fetch corresponding category names using the category_ids
            const categories = yield category_1.default.findAll({
                where: {
                    id: categoryIds, // Get categories with the IDs we already fetched
                },
                attributes: ['id', 'Name'], // Only fetch the ID and name
            });
            // Map the result to include the category name for each subcategory
            const mappedSubcategories = subcategories.map((subcategory) => {
                // Find the matching category for each subcategory
                const category = categories.find((cat) => cat.id === subcategory.category_id);
                return Object.assign(Object.assign({}, subcategory.toJSON()), { categoryName: category ? category.Name : 'Unknown' });
            });
            // Calculate total pages
            const totalPages = Math.ceil(totalCount / pageSizeNum);
            // Send the response with metadata and the mapped subcategories
            res.json({
                status: 1,
                message: 'Subcategories fetched successfully',
                data: mappedSubcategories,
                pagination: {
                    totalPages: totalPages,
                    currentPage: page,
                    pageSize: pageSizeNum,
                }
            });
        }
        catch (error) {
            console.error('Failed to fetch subcategories:', error);
            res.status(500).json({ status: 0, message: 'Failed to fetch subcategories' });
        }
    }),
    UpdateSubcategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id, Name, category_id } = req.body; // Subcategory data
            console.log(req.body, "BODY");
            const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path; // Normalize path
            // Validate subcategory exists
            const existingSubCategory = yield subcategory_1.default.findByPk(id);
            if (!existingSubCategory) {
                return res.status(404).json({ status: 0, message: 'Subcategory not found' });
            }
            // Validate category exists
            if (category_id) {
                const existingCategory = yield category_1.default.findByPk(category_id);
                if (!existingCategory) {
                    return res.status(404).json({ status: 0, message: 'Invalid category selected' });
                }
            }
            // Update the subcategory
            const updatedSubCategory = yield existingSubCategory.update({
                Name: Name !== null && Name !== void 0 ? Name : existingSubCategory.Name,
                image: image !== null && image !== void 0 ? image : existingSubCategory.image,
                category_id: category_id !== null && category_id !== void 0 ? category_id : existingSubCategory.category_id,
            });
            res.json({
                status: 1,
                message: "Subcategory updated successfully",
                data: updatedSubCategory,
            });
        }
        catch (error) {
            console.error('Failed to update subcategory:', error);
            res.status(500).json({ status: 0, message: 'Failed to update subcategory' });
        }
    }),
    DeleteSubcategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.body.id;
            yield subcategory_1.default.destroy({ where: {
                    id: id
                } });
            res.json({ status: 1, message: "subcategory Delete Successfully" });
        }
        catch (error) {
            console.error('Failed to update subcategory:', error);
            res.status(500).json({ status: 0, message: 'Failed to delete subcategory' });
        }
    }),
    UserList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Extract query parameters for pagination, search, and category filter
            const { page = 1, pageSize = 10, search = "" } = req.body;
            // Calculate the offset and limit for pagination
            const offset = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);
            // Create a search filter using Sequelize's `Op.or`
            const searchFilter = {
                where: {
                    [sequelize_1.Op.or]: [
                        { FirstName: { [sequelize_1.Op.like]: `%${search}%` } },
                        { email: { [sequelize_1.Op.like]: `%${search}%` } },
                        sequelize_1.Sequelize.where(sequelize_1.Sequelize.cast(sequelize_1.Sequelize.col("dob"), "text"), {
                            [sequelize_1.Op.like]: `%${search}%`,
                        }),
                        { gender: { [sequelize_1.Op.like]: `%${search}%` } },
                    ],
                },
                offset,
                limit,
            };
            // Add category filter only if it's not "all"
            // Retrieve users with search, pagination, and category filtering
            const { rows, count } = yield index_1.User.findAndCountAll(searchFilter);
            // Calculate total pages
            const totalPages = Math.ceil(count / limit);
            // Send response with paginated and filtered data
            res.json({
                status: 1,
                message: "Users fetched successfully",
                data: rows,
                pagination: {
                    totalPages,
                    totalCount: count,
                    currentPage: Number(page),
                    pageSize: Number(pageSize),
                },
            });
        }
        catch (error) {
            console.error("Error in UserData:", error);
            res.status(500).json({
                status: 0,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }),
    GetAllPost: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, search = "" } = req.body;
            const offset = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);
            const searchFilter = {
                where: {
                    [sequelize_1.Op.or]: [
                        { Title: { [sequelize_1.Op.like]: `%${search}%` } },
                        { Description: { [sequelize_1.Op.like]: `%${search}%` } },
                        { Location: { [sequelize_1.Op.like]: `%${search}%` } },
                    ],
                },
                include: [
                    {
                        model: index_1.User,
                        as: "user", // make sure this matches your alias if any
                        attributes: ["id", "FirstName", "email", "image"], // select only required fields
                    },
                ],
                offset,
                limit,
            };
            const { rows, count } = yield index_1.Post.findAndCountAll(searchFilter);
            const totalPages = Math.ceil(count / limit);
            res.json({
                status: 1,
                message: "Post fetched successfully",
                data: rows,
                pagination: {
                    totalPages,
                    totalCount: count,
                    currentPage: Number(page),
                    pageSize: Number(pageSize),
                },
            });
        }
        catch (error) {
            console.error("Error in post get:", error);
            res.status(500).json({
                status: 0,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }),
    DeleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.body.id;
            // Step 1: Delete posts and interests related to the user
            yield index_1.Post.destroy({ where: { userId: id } });
            yield index_1.Interests.destroy({ where: { userId: id } });
            // Step 2: Manually filter and update groups containing this user
            const allGroups = yield index_1.GroupMember.findAll();
            for (const group of allGroups) {
                const members = group.members || [];
                const hasUser = members.some((m) => m.userId === id);
                if (hasUser) {
                    const updatedMembers = members.filter((m) => m.userId !== id);
                    yield group.update({ members: updatedMembers });
                }
            }
            // Step 3: Delete the user
            yield index_1.User.destroy({ where: { id } });
            return res.json({ status: 1, message: "User deleted successfully" });
        }
        catch (error) {
            console.error("Error in DeleteUser:", error);
            res.status(500).json({
                status: 0,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }),
    GetReportMember: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, search = "" } = req.body;
            const offset = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);
            // Step 1: Get all reports (no GROUP BY)
            const reports = yield Report_1.default.findAll({
                attributes: ["reportedId", "reporterId", "postId"],
            });
            const reportedIds = [...new Set(reports.map((r) => r.reportedId))];
            const reporterIds = [...new Set(reports.map((r) => r.reporterId))];
            const postIds = [...new Set(reports.map((r) => r.postId))];
            // Step 2: Get reported users
            const { count, rows } = yield index_1.User.findAndCountAll({
                attributes: ["id", "FirstName", "email", "image", "isBlock"],
                where: Object.assign({ id: { [sequelize_1.Op.in]: reportedIds } }, (search && {
                    FirstName: { [sequelize_1.Op.like]: `%${search}%` },
                })),
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });
            // Step 3: Get posts
            const posts = yield index_1.Post.findAll({
                attributes: ["id", "Title"],
                where: { id: { [sequelize_1.Op.in]: postIds } },
            });
            // Step 4: Get reporters
            const reporters = yield index_1.User.findAll({
                attributes: ["id", "FirstName", "email", "image"],
                where: { id: { [sequelize_1.Op.in]: reporterIds } },
            });
            // Step 5: Format data
            const formattedRows = rows.map((user) => {
                // Get all reports for this user
                const userReports = reports.filter((r) => r.reportedId === user.id);
                const detailedReports = userReports.map((r) => {
                    const post = posts.find((p) => p.id === r.postId);
                    const reporter = reporters.find((rep) => rep.id === r.reporterId);
                    return {
                        postId: r.postId,
                        postTitle: (post === null || post === void 0 ? void 0 : post.Title) || null,
                        reporter: reporter
                            ? {
                                id: reporter.id,
                                FirstName: reporter.FirstName,
                                email: reporter.email,
                                image: reporter.image,
                            }
                            : null,
                    };
                });
                return Object.assign(Object.assign({}, user.dataValues), { reports: detailedReports });
            });
            // Step 6: Return response
            return res.status(200).json({
                status: 1,
                message: "Reported members fetched successfully",
                data: formattedRows,
                total: count,
                currentPage: Number(page),
                totalPages: Math.ceil(count / limit),
            });
        }
        catch (error) {
            console.error("Error in GetReportMember:", error);
            return res.status(500).json({
                status: 0,
                message: "Internal server error",
                error: error instanceof Error ? error.message : error,
            });
        }
    }),
    GetSupport: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, search = "" } = req.body;
            const offset = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);
            const totalCount = yield customerService_1.default.count({
                where: search ? { subject: { [sequelize_1.Op.like]: `%${search}%` } } : undefined,
            });
            const getSupport = yield customerService_1.default.findAll({
                attributes: ['id', 'subject', 'Description', 'userId', 'isReply'],
                where: search ? { subject: { [sequelize_1.Op.like]: `%${search}%` } } : undefined,
                limit,
                offset,
            });
            console.log(getSupport, "GET SUPPORT");
            const agentData = yield Promise.all(getSupport.map((support) => __awaiter(void 0, void 0, void 0, function* () {
                const agent = yield index_1.User.findOne({
                    where: { id: support.userId },
                    attributes: ['FirstName', 'image'],
                });
                // console.log(agentData,"Agent Data")
                // Check if agent exists before accessing properties
                return Object.assign(Object.assign({}, support.toJSON()), { FullName: agent ? agent.FirstName : null, image: agent ? agent.image : null });
            })));
            return res.status(200).json({
                status: 1,
                message: "Customer service fetched successfully",
                data: agentData,
                pagination: {
                    totalPages: Math.ceil(totalCount / pageSize),
                    totalCount,
                    currentPage: Number(page),
                    pageSize: Number(pageSize),
                },
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 0, message: "Internal server error" });
        }
    }),
    ReplySupport: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id, reply } = req.body;
            const messages = req.messages;
            const support = yield customerService_1.default.findByPk(id);
            if (!support) {
                return res.status(404).json({ message: "Support request not found" });
            }
            const agentemail = support.userId; // Assuming userId is the email of the agent
            const agent = yield index_1.User.findOne({
                where: { id: agentemail },
                attributes: ['email'],
            });
            if (!agent) {
                return res.status(404).json({ message: "usr not found" });
            }
            const replytemailtemplatePath = path_1.default.join(__dirname, "../../views/reply-email.hbs");
            const replytemplateSource = fs_1.default.readFileSync(replytemailtemplatePath, "utf-8");
            const compiledTemplate = handlebars_1.default.compile(replytemplateSource);
            const emailData = {
                companyName: "Your Company Name",
                firstName: agent.FirstName,
                action: "reply to your support request",
                subject: support.subject,
                reply: reply,
                reason: support.Description,
            };
            const htmlContent = compiledTemplate(emailData);
            // **Send Email**
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            const mailOptions = {
                from: "tryoutscout@gmail.com",
                to: support.email,
                subject: `Reply to: ${support.subject}`,
                // text: `Subject: ${support.subject}\n\nReply: ${reply}`,
                html: htmlContent,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending welcome email:", error);
                }
                else {
                    console.log("Welcome email sent:", info.response);
                }
            });
            support.isReply = true; // Set isReply to true
            yield support.save();
            res.status(200).json({ status: 1, message: "Message send successfully" });
        }
        catch (error) {
            console.error('Failed to send :', error);
            res.status(500).json({ status: 0, message: 'Failed to send ' });
        }
    }),
    PostDetails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const postId = req.body.postId;
            const postDetails = yield index_1.Post.findAll({
                where: { id: postId },
                include: [
                    {
                        model: index_1.GroupMember,
                        as: 'groupMembers',
                        attributes: ['members'],
                    },
                    {
                        model: index_1.User,
                        as: 'user',
                        attributes: ['id', 'FirstName', 'image'],
                    },
                ],
            });
            const result = yield Promise.all(postDetails.map((post) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const postJSON = post.toJSON();
                // Combine all members from all groupMembers records
                const membersData = (_b = (_a = postJSON.groupMembers) === null || _a === void 0 ? void 0 : _a.flatMap((group) => group.members)) !== null && _b !== void 0 ? _b : [];
                console.log(membersData, "MEMBER DATA");
                // Fetch each member's details
                const enrichedMembers = yield Promise.all(membersData.map((member) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b, _c;
                    const user = yield index_1.User.findOne({
                        where: { id: member.userId },
                        attributes: ['id', 'FirstName', 'image']
                    });
                    console.log(`Looking for userId: ${member.userId}`, '=> Found:', !!user);
                    return {
                        id: (_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : null,
                        name: (_b = user === null || user === void 0 ? void 0 : user.FirstName) !== null && _b !== void 0 ? _b : null,
                        image: (_c = user === null || user === void 0 ? void 0 : user.image) !== null && _c !== void 0 ? _c : null,
                    };
                })));
                // Clean up
                delete postJSON.groupMembers;
                delete postJSON.user;
                return Object.assign(Object.assign({}, postJSON), { members: enrichedMembers, joinedCount: enrichedMembers.length, groupSize: postJSON.GroupSize, createByUserid: (_d = (_c = post.user) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null, CreatedBy: (_f = (_e = post.user) === null || _e === void 0 ? void 0 : _e.FirstName) !== null && _f !== void 0 ? _f : null, userImage: (_h = (_g = post.user) === null || _g === void 0 ? void 0 : _g.image) !== null && _h !== void 0 ? _h : null });
            })));
            return res.json({
                status: 1,
                message: "Post details fetched successfully",
                data: result
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: 0,
                message: "Internal server error"
            });
        }
    }),
    RemoveMember: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        //   try {
        //     const {postId,memberId} = req.body
        //     const group = await GroupMember.findOne({ where: { postId } });
        //     if (!group) {
        //       return res.status(404).json({ status: 0, message: 'Group not found for this post' });
        //     }
        //    let members: MemberDetails[] = group.members as MemberDetails[];
        //    // Debug: Print current members
        //    console.log('Before removal, members:', members);
        //    // Trim ID for safety
        //    const cleanMemberId = memberId?.toString().trim();
        //    // Remove the member
        //    members = members.filter((member) => member.userId !== cleanMemberId);
        //    // Debug: Print members after filter
        //    console.log('After removal, members:', members);
        //      await group.update({ members });
        //      return res.status(200).json({ status: 1, message: 'Member removed successfully' });
        // } catch (error) {
        //   console.error('Error removing from group:', error);
        //   return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        // }
    }),
    PostDelete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { postId } = req.body;
            if (!postId) {
                return res.status(400).json({ status: 0, message: "Post ID is required." });
            }
            // Step 1: Delete the group related to the post
            yield index_1.GroupMember.destroy({ where: { postId } });
            // Step 2: Delete the post
            const deletedCount = yield index_1.Post.destroy({ where: { id: postId } });
            if (deletedCount === 0) {
                return res.status(404).json({ status: 0, message: "Post not found." });
            }
            return res.status(200).json({ status: 1, message: "Post  deleted successfully." });
        }
        catch (error) {
            console.error("Error deleting post and group:", error);
            return res.status(500).json({ status: 0, message: "Internal server error." });
        }
    }),
    Dashboard: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const totalUsers = yield index_1.User.count();
            const totalPosts = yield index_1.Post.count();
            const totalCategories = yield category_1.default.count();
            const totalSubCategories = yield subcategory_1.default.count();
            const totalReports = yield Report_1.default.count();
            const totalSupport = yield customerService_1.default.count();
            res.json({
                status: 1,
                message: "Dashboard data fetched successfully",
                data: {
                    totalUsers,
                    totalPosts,
                    totalCategories,
                    totalSubCategories,
                    totalReports,
                    totalSupport
                }
            });
        }
        catch (error) {
            console.error("Error fetching dashboard data:", error);
            res.status(500).json({ status: 0, message: "Internal server error" });
        }
    }),
    BlockUnblock: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id, action } = req.body;
            if (!id || !["block", "unblock"].includes(action)) {
                return res.status(400).json({ status: 1, message: "User ID, type, and valid action are required" });
            }
            // Determine block status
            const isBlock = action === "block";
            // Check current status before updating
            const user = yield index_1.User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ status: 1, message: "User not found" });
            }
            if (user.isBlock === isBlock) {
                return res.status(400).json({
                    status: 1,
                    message: isBlock ? "This user is already blocked" : "This user is already unblocked"
                });
            }
            // Update block status
            yield index_1.User.update({ isBlock }, { where: { id } });
            return res.status(200).json({ status: 1, message: `User ${action}ed successfully` });
        }
        catch (error) {
            console.error("Error updating block status:", error);
            return res.status(500).json({ status: 1, message: "Internal server error" });
        }
    }),
};
