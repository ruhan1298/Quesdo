 import express, { Router, Request, Response } from 'express';
 const router: Router = express.Router();
import authController from '../controller/auth';
import upload from '../../middleware/upload';
import UserAuth from '../../middleware/UserAuth';


 router.post("/Login", (req: Request, res: Response) => {
    authController.AdminLogin(req, res);
  });
  router.get("/get-admin",UserAuth, (req: Request, res: Response) => {
    authController.GetAdmin(req, res);
  });
  router.post("/update-admin",upload.single('image'),UserAuth, (req: Request, res: Response) => {
    authController.UpdateAdmin(req, res);
  });
  router.post("/change-pass",UserAuth, (req: Request, res: Response) => {
    authController.ChangePass(req, res);
  });
  router.post("/forget-password", (req: Request, res: Response) => {


    authController.ForgetPassword(req, res);
  });

  router.post("/otp-verify", (req: Request, res: Response) => {


    authController.OtpVerify(req, res);
  });
  router.post("/update-password", (req: Request, res: Response) => {


    authController.UpdatePassword(req, res);
  })
  
  router.post("/add-category", (req: Request, res: Response) => {


    authController.AddCategory(req, res);
  })
  router.post("/get-category", (req: Request, res: Response) => {


    authController.GetCategory(req, res);
  })
  router.post("/delete-category", (req: Request, res: Response) => {


    authController.DeleteCategory(req, res);
  })

  router.post("/update-category", (req: Request, res: Response) => {


    authController.UpdateCategory(req, res);
  })
  router.post("/add-subcategory",upload.single('image'), (req: Request, res: Response) => {


    authController.AddSubCategory(req, res);
  })
  router.post("/get-subcategory", (req: Request, res: Response) => {


    authController.GetSubCategory(req, res);
  })
  router.post("/delete-subcategory", (req: Request, res: Response) => {


    authController.DeleteSubcategory(req, res);
  })
  router.post("/update-subcategory", (req: Request, res: Response) => {


    authController.UpdateSubcategory(req, res);
  })
  router.post("/get-user", (req: Request, res: Response) => {


    authController.UserList(req, res);
  })
  router.post("/get-post", (req: Request, res: Response) => {


    authController.GetAllPost(req, res);
  })
  router.post("/delete-user", (req: Request, res: Response) => {


    authController.DeleteUser(req, res);
  })
  router.post('/get-report', (req: Request, res: Response) => {
    authController.GetReportMember(req, res);
  })
  router.post('/get-customerservice', (req: Request, res: Response) => {
    authController.GetSupport(req, res);
  })
  router.post('/reply-sevrcie', (req: Request, res: Response) => {
    authController.ReplySupport(req, res);
  })
  router.post('/post-details', (req: Request, res: Response) => {
    authController.PostDetails(req, res);
  })
  router.post('/member-remove', (req: Request, res: Response) => {
    authController.RemoveMember(req, res);
  })
  router.post('/delete-post', (req: Request, res: Response) => {
    authController.PostDelete(req, res);
  })

 export default router