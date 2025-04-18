import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import UserController from '../../User/controller/user';
import upload from '../../middleware/upload';
import UserAuth from '../../middleware/UserAuth';
import user from '../../User/controller/user';
import userAuth from '../../middleware/UserAuth';
router.post("/register", (req: Request, res: Response) => {
    UserController.UserRegister(req, res);
  });
  
  // Route for customer login
  router.post("/login", (req: Request, res: Response) => {
    UserController.UserLogin(req, res);
  });
  router.post("/update-profile", upload.single('image'),UserAuth,(req: Request, res: Response) => {
  
      UserController.UserUpdate(req, res);
    });
    router.post("/change-password",UserAuth, (req: Request, res: Response) => {
  
      UserController.ChangePass(req, res);
    });
    
  
  
    router.post("/Social-Login", (req: Request, res: Response) => {
  
      UserController.SocialLogin(req, res);
    });
    
    router.post("/forget-password", (req: Request, res: Response) => {
  
  
      UserController.ForgetPassword(req, res);
    });
    router.post("/otp-verify", (req: Request, res: Response) => {
  
  
      UserController.OtpVerify(req, res);
    });
    router.post("/update-password", (req: Request, res: Response) => {
  
  
      UserController.UpdatePassword(req, res);
    })
    router.post("/get-category",userAuth, (req: Request, res: Response) => {
  
  
      UserController.GetCategory(req, res);
    })
    router.post("/get-subcategory", (req: Request, res: Response) => {
  
  
      UserController.GetSubcategory(req, res);
    })
    router.post("/complete-profile",upload.single('image'), userAuth,(req: Request, res: Response) => {
  
  
      UserController.CompleteProfile(req, res);
    })
    router.post("/get-profile", userAuth,(req: Request, res: Response) => {
  
  
      UserController.GetProfile(req, res);
    })

    router.post("/add-post",upload.single('image'), userAuth,(req: Request, res: Response) => {
  
  
      UserController.AddPost(req, res);
    })
    router.post("/get-post",userAuth,(req: Request, res: Response) => {
  
  
      UserController.GetPost(req, res);
    })
    router.post("/delete-post",userAuth,(req: Request, res: Response) => {
  
  
      UserController.DeletePost(req, res);
    })
    
    router.post("/update-post",upload.single('image'),userAuth,(req: Request, res: Response) => {
  
  
      UserController.UpdatePost(req, res);
    })
    
    router.post("/join-group",userAuth,(req: Request, res: Response) => {
  
  
      UserController.JoinGroup(req, res);
    })

    router.post("/Accept-request",userAuth,(req: Request, res: Response) => {
  
  
      UserController.AcceptRequest(req, res);
    })
    router.post("/remove-member",userAuth,(req: Request, res: Response) => {
  
  
    })
    router.post("/left-group",userAuth,(req: Request, res: Response) => {
  
  
      UserController.LeftFromGroup(req, res);
    })
router.post("/report",userAuth,(req: Request, res: Response) => {
    
    
        UserController.ReportMember(req, res);
      })
      router.post("/add-customerservice",userAuth,(req: Request, res: Response) => {
    
    
        UserController.AddcustomerService(req, res);
      })
      router.post("/home-page",userAuth,(req: Request, res: Response) => {
    
    
        UserController.HomePage(req, res);
      })

      router.post("/post-details",userAuth,(req: Request, res: Response) => {
    
    
        UserController.PostDetails(req, res);
      })

      router.post("/map-data",userAuth,(req: Request, res: Response) => {
    
    
        UserController.MapData(req, res);
      })
      router.post("/group-details",userAuth,(req: Request, res: Response) => {
    
    
        UserController.postGroupDetails(req, res);
      })

      router.post("/notification-setting",userAuth,(req: Request, res: Response) => {
    
    
        UserController.GetSettingNotification(req, res);
      })
      router.post("/get-notification",userAuth,(req: Request, res: Response) => {
    
    
        UserController.GetNotification(req, res);
      })

      router.post("/getall-subcategory",userAuth,(req: Request, res: Response) => {
    
    
        UserController.GetAllSubcategory(req, res);
      })

export default router