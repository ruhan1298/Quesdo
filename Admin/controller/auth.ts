import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import hbs from "handlebars";
import Admin from "../models/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Category from "../models/category";
import { Op, Sequelize } from "sequelize";
import SubCategory from "../models/subcategory";
import { Group, Interests, Post, User } from "../../model/index";

import Report from "../../User/models/Report";
import customerService from "../../User/models/customerService";
import GroupMember from "../../User/models/GroupMember";
const templatePath = path.join(__dirname, '../../views/otptemplate.hbs');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = hbs.compile(source);
type MemberDetail = {
  id: string;
  name: string;
  // ...other fields
};
interface MemberDetails {
  userId: string;
  status: 'pending' | 'joined';
}


export default {
AdminLogin: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {
        return res
          .status(400)
          .json({ status: 0, message: "All input is required." });
      }

      // Find user by email
      const user = await Admin.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ status: 0, message: "Invalid Email" });
      }

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password as unknown as string
      );

      if (!isPasswordValid) {
        return res.status(400).json({ status: 0, message: "Invalid Password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          mobilenumber: user.mobilenumber,},
        process.env.TOKEN_KEY as string, // Use your secret key stored in .env
      );

      // Respond with user data and the generated token
      return res.status(200).json({
        status: 1,
        message: "Login successful",
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          mobilenumber: user.mobilenumber,
          image:user.image,
          token: token,
        },
      });
    } catch (error) {
      // Handle unexpected errors
      console.error(error);
      return res
        .status(500)
        .json({ status: 0, message: "Internal server error" });
    }
  },
  GetAdmin: async (req: Request, res: Response) => {
    const user_id = req.user?.id;
    console.log();
    

    const getAdmin = await Admin.findAll({
      where: {
        id: user_id,
      },
    });
    res.json({
      status: 1,
      message: "Admin profile get succesfully",
      data: getAdmin,
    });
  },
  UpdateAdmin: async (req: Request, res: Response) => {
    try {
      // Get user_id from the request
      const user_id = req.user?.id;
      if (!user_id) {
        return res
          .status(400)
          .json({ message: "User ID is missing or invalid" });
      }

      // Get the updated user data from the request body
      const { fullName, email, mobilenumber } = req.body;
      console.log(req.body, "BODY");
      const image = req.file?.path; // Normalize path

      // Validate required fields

      // Assuming you're using Mongoose to interact with your database
      // You can modify this to use Sequelize or your specific ORM
      let user = await Admin.findByPk(user_id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update the user's information
      user.fullName = fullName ?? user.fullName;
      user.email = email ?? user.email;
      user.mobilenumber = mobilenumber ?? user.mobilenumber;
      user.image = image ?? user.image;
      
      await user.save();

      // Return success response with the updated user data
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  ChangePass: async (req: Request, res: Response) => {
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

      const user = await Admin.findByPk(req.user?.id);
      console.log(user, "USER GET");

      if (!user) {
        return res.status(404).json({ status: 0, message: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password); // Ensure 'user.password' is a string

      if (!isValidPassword) {
        return res
          .status(400)
          .json({ status: 0, message: "Invalid old password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
      await user.save();

      return res
        .status(200)
        .json({ status: 1, message: "Password changed successfully" });
    } catch (err: any) {
      console.error("Error:", err.message);
      return res
        .status(500)
        .json({ status: 0, message: "Failed to change password" });
    }
  },
  ForgetPassword: async (req: Request, res: Response) => {
    const email = req.body.email;

  try {
    // Step 1: Check if email exists in the database
    const user = await Admin.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ status: 0, message: 'Please enter a valid email' });
    }

    // Step 2: Generate OTP (Random token for password reset)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expiration in 10 minutes
    await user.update({
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
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service provider
      auth: {
        user: 'tryoutscout@gmail.com',
        pass: 'xapfekrrmvvghexe'
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

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 0, message: 'Internal server error' });
  }

},
OtpVerify: async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  console.log(req.body, "BODY");
  if(!otp){
  return  res.json({status:0, message:"email and otp required"})
  }

  try {
    // Step 1: Check if the email exists
    const user = await Admin.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: 0,
        message: 'User not found',
      });
    }

    // Step 2: Check if the OTP is valid
    const currentTime = new Date();
    if (
      user.resetPasswordToken !== otp || // OTP mismatch
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
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      status: 0,
      message: 'Internal Server Error',
    });
  }
},
UpdatePassword: async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  try {
    const user = await Admin.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: 0,
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ status: 1, message: "Password updated successfully" });

  } catch (error: any) {
    console.error("Error updating password:", error); // Log the actual error
    return res.status(500).json({
      status: 0,
      message: 'Internal Server Error',
    });
  }
},


AddCategory: async (req: Request, res: Response) => {
  try {
      const Name = req.body.Name
      const Addcat= await Category.create({
          Name
      }) 
      res.json({status:1, message:"category Add Successfully",data:Addcat})
      
  } catch (error) {
      console.error('Failed to update User:', error);
      res.status(500).json({ status: 0, message: 'Failed to add  category' });
  }
},
GetCategory: async (req: Request, res: Response) => {
  try {
      // Extract and parse pagination and search parameters
      const { search = '', pageSize = 10 } = req.body;
      let page: number = search ? 1 : parseInt(req.body.page, 10) || 1;

      // Parse pageSize as a number
      const pageSizeNum: number = parseInt(pageSize as string, 10);

      // Calculate offset for pagination
      const offset = (page - 1) * pageSizeNum;

      // Query categories with pagination and search
      const { rows: categories, count: totalCount } = await Category.findAndCountAll({
          attributes: ['id', 'Name'], // Select specific fields
          where: search
              ? {
                    Name: {
                        [Op.like]: `%${search}%`, // Case-insensitive partial match
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
          pagination:{
           totalPages:totalPages, 
           currentPage:page,  
           pageSize: pageSizeNum,

          }
         
      });
  } catch (error) {
      console.error('Failed to fetch categories:', error);
      res.status(500).json({ status: 0, message: 'Failed to fetch categories' });
  }
},

AddSubCategory: async (req: Request, res: Response) => {
  try {
      const {Name, category_id} = req.body
       console.log(req.body,"BODY");
             const image = req.file?.path

       


      const Addsubcat= await SubCategory.create({
          Name,
          category_id,
          image
          
      }) 
      res.json({status:1, message:"subcategory Add Successfully",data:Addsubcat})
      
  } catch (error) {
      console.error('Failed to update User:', error);
      res.status(500).json({ status: 0, message: 'Failed to add  subcategory' });
  }
},
UpdateCategory: async (req: Request, res: Response) => {
  try {
      const { id ,Name} = req.body; 
      
      const existingCategory = await Category.findByPk(id);
      if (!existingCategory) {
          return res.status(404).json({ status: 0, message: 'Category not found' });
      }

      // Update the category
      const updatedCategory = await existingCategory.update({
          Name: Name ?? existingCategory.Name,
      });

      res.json({
          status: 1,
          message: "Category updated successfully",
          data: updatedCategory,
      });
  } catch (error) {
      console.error('Failed to update category:', error);
      res.status(500).json({ status: 0, message: 'Failed to update category' });
  }

},
DeleteCategory: async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const deletedCount = await Category.destroy({ where: { id } });

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

  } catch (error: any) {
    console.error("Error deleting category:", error); // Log for debugging

    return res.status(500).json({
      status: 0,
      message: 'Failed to delete category',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
},

GetSubCategory: async (req: Request, res: Response) => {
  try {
      // Extract and parse pagination and search parameters
      const { search = '', pageSize = 10 } = req.body;
      let page: number = search ? 1 : parseInt(req.body.page, 10) || 1;

      // Parse pageSize as a number
      const pageSizeNum: number = parseInt(pageSize as string, 10);

      // Calculate offset for pagination
      const offset = (page - 1) * pageSizeNum;

      // Query subcategories with pagination and search
      const { rows: subcategories, count: totalCount } = await SubCategory.findAndCountAll({
          attributes: ['id', 'Name', 'category_id','image'], // Select specific fields from subcategory
          where: search
              ? {
                    Name: {
                        [Op.like]: `%${search}%`, // Case-insensitive partial match
                    },
                }
              : undefined,
          limit: pageSizeNum,
          offset,
      });

      // Extract all unique category_ids from subcategories
      const categoryIds = [...new Set(subcategories.map((sub) => sub.category_id))];

      // Fetch corresponding category names using the category_ids
      const categories = await Category.findAll({
          where: {
              id: categoryIds, // Get categories with the IDs we already fetched
          },
          attributes: ['id', 'Name'], // Only fetch the ID and name
      });

      // Map the result to include the category name for each subcategory
      const mappedSubcategories = subcategories.map((subcategory) => {
          // Find the matching category for each subcategory
          const category = categories.find((cat) => cat.id === subcategory.category_id);
          return {
              ...subcategory.toJSON(), // Get the subcategory data
              categoryName: category ? category.Name : 'Unknown', // Add category name
          };
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSizeNum);

      // Send the response with metadata and the mapped subcategories
      res.json({
          status: 1,
          message: 'Subcategories fetched successfully',
          data: mappedSubcategories,
          pagination:{
              totalPages:totalPages, 
              currentPage:page,  
              pageSize: pageSizeNum,

             }
      });
  } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      res.status(500).json({ status: 0, message: 'Failed to fetch subcategories' });
  }
},

UpdateSubcategory: async (req: Request, res: Response) => {
  try {
      const { id, Name, category_id } = req.body; // Subcategory data
      const image = req.file?.path; // Normalize path

      // Validate subcategory exists
      const existingSubCategory = await SubCategory.findByPk(id);
      if (!existingSubCategory) {
          return res.status(404).json({ status: 0, message: 'Subcategory not found' });
      }

      // Validate category exists
      if (category_id) {
          const existingCategory = await Category.findByPk(category_id);
          if (!existingCategory) {
              return res.status(404).json({ status: 0, message: 'Invalid category selected' });
          }
      }

      // Update the subcategory
      const updatedSubCategory = await existingSubCategory.update({
          Name: Name ?? existingSubCategory.Name,
          image: image ?? existingSubCategory.image,

          category_id: category_id ?? existingSubCategory.category_id,
      });

      res.json({
          status: 1,
          message: "Subcategory updated successfully",
          data: updatedSubCategory,
      });
  } catch (error) {
      console.error('Failed to update subcategory:', error);
      res.status(500).json({ status: 0, message: 'Failed to update subcategory' });
  }
},


DeleteSubcategory: async (req: Request, res: Response) => {
  try {
      const id = req.body.id;
       await SubCategory.destroy({where:{
          id:id
      }});
      res.json({ status: 1, message: "subcategory Delete Successfully" });
    } catch (error) {
      console.error('Failed to update subcategory:', error);
      res.status(500).json({ status: 0, message: 'Failed to delete subcategory' });

     }
},
UserList: async (req: Request, res: Response) => {
  try {
    // Extract query parameters for pagination, search, and category filter
    const { page = 1, pageSize = 10, search = "" } = req.body;

    // Calculate the offset and limit for pagination
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // Create a search filter using Sequelize's `Op.or`
    const searchFilter: any = {
      where: {
        [Op.or]: [
          { FirstName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { dob: { [Op.like]: `%${search}%` } },
          { gender: { [Op.like]: `%${search}%` } },

      
        ],
      },
      offset,
      limit,
    };

    // Add category filter only if it's not "all"


    // Retrieve users with search, pagination, and category filtering
    const { rows, count } = await User.findAndCountAll(searchFilter);

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
  } catch (error) {
    console.error("Error in UserData:", error);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
},
GetAllPost: async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.body;

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const searchFilter: any = {
      where: {
        [Op.or]: [
          { Title: { [Op.like]: `%${search}%` } },
          { Description: { [Op.like]: `%${search}%` } },
          { Location: { [Op.like]: `%${search}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "user", // make sure this matches your alias if any
          attributes: ["id", "FirstName", "email","image"], // select only required fields
        },
      ],
      offset,
      limit,
    };

    const { rows, count } = await Post.findAndCountAll(searchFilter);

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

  } catch (error) {
    console.error("Error in post get:", error);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
},
DeleteUser: async (req: Request, res: Response) => {
  try {
    const id = req.body.id;

    // Step 1: Delete posts related to the user
    await Post.destroy({
      where: { userId: id },
    });

    await Interests.destroy({
      where: { userId: id },
    });

    // Step 2: Remove user from all group members list (if `members` is JSON array)
   await Group.findAll({
      where: Sequelize.where(Sequelize.fn('JSON_CONTAINS', Sequelize.col('members'), JSON.stringify(id)), 1),
    });

    await User.destroy({
      where: { id },
    });

    res.json({ status: 1, message: "User deleted successfully" });

  } catch (error) {
    console.error("Error in DeleteUser:", error);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
},
GetReportMember: async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.body;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // Step 1: Get all reported user IDs from the Report table
    const reports = await Report.findAll({
      attributes: ["reportedId", "reporterId", "postId"], // Get reporterId and postId as well
      group: ["reportedId"],
    });

    const reportedIds = reports.map((r: any) => r.reportedId);
    const reporterIds = reports.map((r: any) => r.reporterId); // Get the reporter IDs

    // Step 2: Find reported users from the User table
    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'FirstName', 'email', 'image'],
      where: {
        id: {
          [Op.in]: reportedIds,
        },
        ...(search && {
          FirstName: {
            [Op.like]: `%${search}%`,
          },
        }),
      },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    // Step 3: Find the titles of the posts that were reported
    const postIds = reports.map((r: any) => r.postId); // Collect all postIds
    const posts = await Post.findAll({
      attributes: ['id', 'Title'],
      where: {
        id: {
          [Op.in]: postIds,
        },
      },
    });
    console.log(posts, "POSTS");
    

    // Step 4: Find the details of the users who reported (reporterId)
    const reporters = await User.findAll({
      attributes: ['id', 'FirstName', 'email', 'image'],
      where: {
        id: {
          [Op.in]: reporterIds,
        },
      },
    });
    console.log(reporters, "REPORTER");
    

    // Step 5: Format the response to include the post titles and reporter details
    const formattedRows = rows.map((user: any) => {
      // Find the post related to the report for the user
      const post = posts.find((p: any) => p.id === user.id);
      const reporter = reporters.find((r: any) => r.id === user.id);

      return {
        ...user.dataValues,
        reportedPostTitle: post ? post.Title : null,
        reporterDetails: reporter
          ? {
              id: reporter.id,
              FirstName: reporter.FirstName,
              email: reporter.email,
              image: reporter.image,
            }
          : null,
      };

    });

    // Step 6: Send the response
    return res.status(200).json({
      status: 1,
      message: "Reported members fetched successfully",
      data: formattedRows,
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error in GetReportMember:", error);
    res.status(500).json({
      status: 0,
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
},
GetSupport : async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search = "" } = req.body;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const totalCount = await customerService.count({
      where: search ? { subject: { [Op.like]: `%${search}%` } } : undefined,
  
    });
    const getSupport = await customerService.findAll({  
        
        attributes: ['id', 'subject', 'Description','userId','isReply'],
        where: search ? { subject: { [Op.like]: `%${search}%` } } : undefined,
        limit,
        offset,
      });    
      console.log(getSupport, "GET SUPPORT");
      
  
    const agentData = await Promise.all(
      getSupport.map(async (support) => {
        const agent = await User.findOne({
          where: { id: support.userId },
          attributes: ['FirstName', 'image'],
        });
        // console.log(agentData,"Agent Data")
        // Check if agent exists before accessing properties
        return {
          ...support.toJSON(),
          FullName:agent?  agent.FirstName : null,
          image: agent ? agent.image : null,
        };
      })
    );
    return res.status(200).json({ 
      status: 1,
      message:"Customer service fetched successfully",
      data: agentData,
      pagination: {
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        currentPage: Number(page),
        pageSize: Number(pageSize),
      },
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Internal server error" });
    
  }
      },
      ReplySupport: async (req: Request, res: Response) => {
        try {
          const { id, reply } = req.body;
          const messages = (req as any).messages
          const support = await customerService.findByPk(id);
          if (!support) {
            return res.status(404).json({ message: messages.supportNotFound });
          }
          const agentemail = support.userId; // Assuming userId is the email of the agent
          const agent = await User.findOne({
            where: { id: agentemail },
            attributes: ['email'],
          });
          if (!agent) {
            return res.status(404).json({ message: "usr not found" });
          }
          const replytemailtemplatePath = path.join(__dirname, "../../views/reply-email.hbs");
          const replytemplateSource = fs.readFileSync(replytemailtemplatePath, "utf-8");
          const compiledTemplate = hbs.compile(replytemplateSource);
         
     
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
          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: "tryoutscout@gmail.com",
                  pass: "xapfekrrmvvghexe",
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
              } else {
                  console.log("Welcome email sent:", info.response);
              }
          });  
      
                support.isReply = true; // Set isReply to true
          await support.save();
          res.status(200).json({ status: 1, message: "Message send successfully" });
          
        } catch (error) {
          console.error('Failed to send :', error);
          res.status(500).json({ status: 0, message: 'Failed to send ' });
    
          
        }
      },
      PostDetails: async (req: Request, res: Response) => {
        try {
          const postId = req.body.postId;
      
          const postDetails = await Post.findAll({
            where: { id: postId },
            include: [
              {
                model: GroupMember,
                as: 'group',
                attributes: ['members'],
              },
              {
                model: User,
                as: 'user',
                attributes: ['id', 'FirstName', 'image'],
              },
            ],
          });
      
          const result = await Promise.all(postDetails.map(async (post: any) => {
            const postJSON = post.toJSON();
      
            const membersData = postJSON.group?.members ?? [];
            console.log(membersData,"MEMBER DATA");
            
      
            // Fetch each member's name and image
            const enrichedMembers = await Promise.all(
              membersData.map(async (member: any) => {
                const user = await User.findOne({
                  where: { id: member.userId },
                  attributes: ['id','FirstName', 'image']
                });
          console.log(user,"USER");
            
                console.log(`Looking for userId: ${member.userId}`, '=> Found:', !!user);
            
                return {
                  id:user?.id ?? null ,
                  name: user?.FirstName ?? null,
                  image: user?.image ?? null,
                };
              })
            );
      
            // Remove unwanted fields
            delete postJSON.group;
            delete postJSON.user;
      
            return {
              ...postJSON,
              members: enrichedMembers,
              joinedCount: enrichedMembers.length,
              groupSize: postJSON.GroupSize,
              createByUserid:post.user?.id ?? null ,
              CreatedBy: post.user?.FirstName ?? null,
              userImage: post.user?.image ?? null,
            };
          }));
      
          return res.json({
            status: 1,
            message: "Post details fetched successfully",
            data: result
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            status: 0,
            message: "Internal server error"
          });
        }
      },
      RemoveMember: async (req:Request,res:Response) =>{
        try {
          const {postId,memberId} = req.body
          const group = await Group.findOne({ where: { postId } });

          if (!group) {
            return res.status(404).json({ status: 0, message: 'Group not found for this post' });
          }

         let members: MemberDetails[] = group.members as MemberDetails[];
     
         // Debug: Print current members
         console.log('Before removal, members:', members);
     
         // Trim ID for safety
         const cleanMemberId = memberId?.toString().trim();
     
         // Remove the member
         members = members.filter((member) => member.userId !== cleanMemberId);
     
         // Debug: Print members after filter
         console.log('After removal, members:', members);
     
     
           await group.update({ members });
           return res.status(200).json({ status: 1, message: 'Member removed successfully' });
     
    
      } catch (error) {
        console.error('Error removing from group:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
      }
      },
      PostDelete: async (req: Request, res: Response) => {
        try {
          const { postId } = req.body;
      
          if (!postId) {
            return res.status(400).json({status: 0, message: "Post ID is required." });
          }
      
          // Step 1: Delete the group related to the post
          await Group.destroy({ where: { postId } });
      
          // Step 2: Delete the post
          const deletedCount = await Post.destroy({ where: { id: postId } });
      
          if (deletedCount === 0) {
            return res.status(404).json({status: 0, message: "Post not found." });
          }
      
          return res.status(200).json({ status:1,message: "Post  deleted successfully." });
        } catch (error) {
          console.error("Error deleting post and group:", error);
          return res.status(500).json({status: 0, message: "Internal server error." });
        }
      }
      

  }