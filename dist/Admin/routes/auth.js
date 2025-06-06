"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../controller/auth"));
const upload_1 = __importDefault(require("../../middleware/upload"));
const UserAuth_1 = __importDefault(require("../../middleware/UserAuth"));
router.post("/Login", (req, res) => {
    auth_1.default.AdminLogin(req, res);
});
router.get("/get-admin", UserAuth_1.default, (req, res) => {
    auth_1.default.GetAdmin(req, res);
});
router.post("/update-admin", upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    auth_1.default.UpdateAdmin(req, res);
});
router.post("/change-pass", UserAuth_1.default, (req, res) => {
    auth_1.default.ChangePass(req, res);
});
router.post("/forget-password", (req, res) => {
    auth_1.default.ForgetPassword(req, res);
});
router.post("/otp-verify", (req, res) => {
    auth_1.default.OtpVerify(req, res);
});
router.post("/update-password", (req, res) => {
    auth_1.default.UpdatePassword(req, res);
});
router.post("/add-category", (req, res) => {
    auth_1.default.AddCategory(req, res);
});
router.post("/get-category", (req, res) => {
    auth_1.default.GetCategory(req, res);
});
router.post("/delete-category", (req, res) => {
    auth_1.default.DeleteCategory(req, res);
});
router.post("/update-category", (req, res) => {
    auth_1.default.UpdateCategory(req, res);
});
router.post("/add-subcategory", upload_1.default.single('image'), (req, res) => {
    auth_1.default.AddSubCategory(req, res);
});
router.post("/get-subcategory", (req, res) => {
    auth_1.default.GetSubCategory(req, res);
});
router.post("/delete-subcategory", (req, res) => {
    auth_1.default.DeleteSubcategory(req, res);
});
router.post("/update-subcategory", upload_1.default.single('image'), (req, res) => {
    auth_1.default.UpdateSubcategory(req, res);
});
router.post("/get-user", (req, res) => {
    auth_1.default.UserList(req, res);
});
router.post("/get-post", (req, res) => {
    auth_1.default.GetAllPost(req, res);
});
router.post("/delete-user", (req, res) => {
    auth_1.default.DeleteUser(req, res);
});
router.post('/get-report', (req, res) => {
    auth_1.default.GetReportMember(req, res);
});
router.post('/get-customerservice', (req, res) => {
    auth_1.default.GetSupport(req, res);
});
router.post('/reply-sevrcie', (req, res) => {
    auth_1.default.ReplySupport(req, res);
});
router.post('/post-details', (req, res) => {
    auth_1.default.PostDetails(req, res);
});
router.post('/member-remove', (req, res) => {
    auth_1.default.RemoveMember(req, res);
});
router.post('/delete-post', (req, res) => {
    auth_1.default.PostDelete(req, res);
});
router.post('/dashboard', (req, res) => {
    auth_1.default.Dashboard(req, res);
});
router.post('/block-unblock', (req, res) => {
    auth_1.default.BlockUnblock(req, res);
});
exports.default = router;
