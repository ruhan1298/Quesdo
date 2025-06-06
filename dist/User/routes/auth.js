"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../../User/controller/user"));
const upload_1 = __importDefault(require("../../middleware/upload"));
const UserAuth_1 = __importDefault(require("../../middleware/UserAuth"));
router.post("/register", (req, res) => {
    user_1.default.UserRegister(req, res);
});
// Route for customer login
router.post("/login", (req, res) => {
    user_1.default.UserLogin(req, res);
});
router.post("/update-profile", upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    user_1.default.UserUpdate(req, res);
});
router.post("/change-password", UserAuth_1.default, (req, res) => {
    user_1.default.ChangePass(req, res);
});
router.post("/Social-Login", (req, res) => {
    user_1.default.SocialLogin(req, res);
});
router.post("/forget-password", (req, res) => {
    user_1.default.ForgetPassword(req, res);
});
router.post("/otp-verify", (req, res) => {
    user_1.default.OtpVerify(req, res);
});
router.post("/update-password", (req, res) => {
    user_1.default.UpdatePassword(req, res);
});
router.post("/get-category", UserAuth_1.default, (req, res) => {
    user_1.default.GetCategory(req, res);
});
router.post("/get-subcategory", (req, res) => {
    user_1.default.GetSubcategory(req, res);
});
router.post("/complete-profile", UserAuth_1.default, upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    user_1.default.CompleteProfile(req, res);
});
router.post("/get-profile", UserAuth_1.default, (req, res) => {
    user_1.default.GetProfile(req, res);
});
router.post("/add-post", upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    user_1.default.AddPost(req, res);
});
router.post("/get-post", UserAuth_1.default, (req, res) => {
    user_1.default.GetPost(req, res);
});
router.post("/delete-post", UserAuth_1.default, (req, res) => {
    user_1.default.DeletePost(req, res);
});
router.post("/update-post", upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    user_1.default.UpdatePost(req, res);
});
router.post("/join-group", UserAuth_1.default, (req, res) => {
    user_1.default.JoinGroup(req, res);
});
router.post("/Accept-request", UserAuth_1.default, (req, res) => {
    user_1.default.AcceptRequest(req, res);
});
router.post("/remove-member", UserAuth_1.default, (req, res) => {
    user_1.default.RemoveFromGroup(req, res);
});
router.post("/left-group", UserAuth_1.default, (req, res) => {
    user_1.default.LeftFromGroup(req, res);
});
router.post("/report", UserAuth_1.default, (req, res) => {
    user_1.default.ReportMember(req, res);
});
router.post("/add-customerservice", UserAuth_1.default, (req, res) => {
    user_1.default.AddcustomerService(req, res);
});
router.post("/home-page", UserAuth_1.default, (req, res) => {
    user_1.default.HomePage(req, res);
});
router.post("/post-details", UserAuth_1.default, (req, res) => {
    user_1.default.PostDetails(req, res);
});
router.post("/map-data", UserAuth_1.default, (req, res) => {
    user_1.default.MapData(req, res);
});
router.post("/group-details", UserAuth_1.default, (req, res) => {
    user_1.default.postGroupDetails(req, res);
});
router.post("/notification-setting", UserAuth_1.default, (req, res) => {
    user_1.default.GetSettingNotification(req, res);
});
router.post("/get-notification", UserAuth_1.default, (req, res) => {
    user_1.default.GetNotification(req, res);
});
router.post("/update-notification", UserAuth_1.default, (req, res) => {
    user_1.default.UpdateSettingNotification(req, res);
});
router.post("/getall-subcategory", UserAuth_1.default, (req, res) => {
    user_1.default.GetAllSubcategory(req, res);
});
router.post("/getmy-profile", UserAuth_1.default, (req, res) => {
    user_1.default.GetMyProfile(req, res);
});
router.post("/cancel-post", UserAuth_1.default, (req, res) => {
    user_1.default.CancelPost(req, res);
});
router.post("/Archive-list", UserAuth_1.default, (req, res) => {
    user_1.default.ArchiveGroup(req, res);
});
router.post("/reopen-post", upload_1.default.single('image'), UserAuth_1.default, (req, res) => {
    user_1.default.RecreateGroupFromArchive(req, res);
});
router.post("/delete-interests", UserAuth_1.default, (req, res) => {
    user_1.default.DeleteInterests(req, res);
});
router.post("/recent-qess", UserAuth_1.default, (req, res) => {
    user_1.default.RecentQess(req, res);
});
exports.default = router;
