import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import UserController from '../../User/controller/user';
import upload from '../../middleware/upload';
import UserAuth from '../../middleware/UserAuth';
import user from '../../User/controller/user';
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
    router.post("/get-category",UserAuth, (req: Request, res: Response) => {
  
  
      UserController.GetCategory(req, res);
    })
    router.post("/get-subcategory", (req: Request, res: Response) => {
  
  
      UserController.GetSubcategory(req, res);
    })
    router.post("/complete-profile",UserAuth,upload.single('image'), UserAuth,(req: Request, res: Response) => {
  
  
      UserController.CompleteProfile(req, res);
    })
    router.post("/get-profile", UserAuth,(req: Request, res: Response) => {
  
  
      UserController.GetProfile(req, res);
    })

    router.post("/add-post",upload.single('image'), UserAuth,(req: Request, res: Response) => {
  
  
      UserController.AddPost(req, res);
    })
    router.post("/get-post",UserAuth,(req: Request, res: Response) => {
  
  
      UserController.GetPost(req, res);
    })
    router.post("/delete-post",UserAuth,(req: Request, res: Response) => {
  
  
      UserController.DeletePost(req, res);
    })
    
    router.post("/update-post",upload.single('image'),UserAuth,(req: Request, res: Response) => {
  
  
      UserController.UpdatePost(req, res);
    })
    
    router.post("/join-group",UserAuth,(req: Request, res: Response) => {
  
  
      UserController.JoinGroup(req, res);
    })

    router.post("/Accept-request",UserAuth,(req: Request, res: Response) => {
  
  
      UserController.AcceptRequest(req, res);
    })
    router.post("/remove-member",UserAuth,(req: Request, res: Response) => {
      UserController.RemoveFromGroup(req, res);  
  
  
    })
    router.post("/left-group",UserAuth,(req: Request, res: Response) => {
  
  
      UserController.LeftFromGroup(req, res);
    })
router.post("/report",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.ReportMember(req, res);
      })
      router.post("/add-customerservice",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.AddcustomerService(req, res);
      })
      router.post("/home-page",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.HomePage(req, res);
      })

      router.post("/post-details",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.PostDetails(req, res);
      })

      router.post("/map-data",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.MapData(req, res);
      })
      router.post("/group-details",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.postGroupDetails(req, res);
      })

      router.post("/notification-setting",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.GetSettingNotification(req, res);
      })
      router.post("/get-notification",UserAuth,(req: Request, res: Response) => {
    

    
        UserController.GetNotification(req, res);
      })
      router.post("/update-notification",UserAuth,(req: Request, res: Response) => {
    

    
        UserController.UpdateSettingNotification(req, res);
      })


      router.post("/getall-subcategory",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.GetAllSubcategory(req, res);
      })
      router.post("/getmy-profile",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.GetMyProfile(req, res);
      })
      router.post("/cancel-post",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.CancelPost(req, res);
      })

            router.post("/Archive-list",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.ArchiveGroup(req, res);
      })
          router.post("/reopen-post",upload.single('image'),UserAuth,(req: Request, res: Response) => {
    
    
        UserController.RecreateGroupFromArchive(req, res);
      })

      router.post("/delete-interests",UserAuth,(req: Request, res: Response) => {
    
    
        UserController.DeleteInterests(req, res);
      })
      router.post("/recent-qess",UserAuth,(req: Request, res: Response) => {
        UserController.RecentQess(req, res);
      })


export default router