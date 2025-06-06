import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import hbs from "handlebars";
import { randomBytes } from 'crypto';
import {notificationQueue} from '../../middleware/notificationQueue'
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import sequelize, { Category, GroupMember, SubCategory } from "../../model";
import { Op, where,literal } from "sequelize";
import Interests from "../models/Interests";
import Post from "../models/post";
import Report from "../models/Report";
import moment from 'moment';

import customerService from "../models/customerService";
// import GroupMember from "../models/GroupMember";
import Notification from "../models/Notification";
import haversine from 'haversine-distance'; // npm i haversine-distance
import {sendRealTimeNotification} from '../../middleware/sendnotification'
import { log } from "util";

const templatePath = path.join(__dirname, '../../views/otptemplate.hbs');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = hbs.compile(source);
interface MemberDetail {
  userId: string;
  status: 'pending' | 'joined';
  isArchive:boolean
}
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2)); // round to 2 decimal places
}


export default {

    UserRegister: async (req: Request, res: Response) => {
        try {
          const {  password, email,deviceToken,deviceType } = req.body;
    // const image ='uploads\\bead2399-9898-4b74-9650-bf2facdaaafa.png'
          // Validate input
          if (!email || !password) {
            return res.json({ status: 0, message: "All input is required." });
          }
    
          // Check if user already exists
          const oldUser = await User.findOne({ where: { email } });
          if (oldUser) {
            return res.json({ status: 0, message: "Email already exists." });
          }
    
          // Encrypt password
          const encryptedPassword = await bcrypt.hash(password, 10);
  
  
    
          // Create new user
          const newUser = await User.create({
        
            password: encryptedPassword,
            email,
            deviceToken,
            deviceType

        
          });
    
          // Generate JWT token
          const token = jwt.sign(
            {
              id: newUser.id,
              email: newUser.email,
            },
            process.env.TOKEN_KEY as string,
            // { expiresIn: "2h" } // Token expiration time
          );
    
          // Prepare response data
          const data = {
            id: newUser.id,
            email: newUser.email,
            image:newUser.image,
            token,
          };
    
          return res.json({ status: 1, message: "User registered successfully", data });
        } catch (error) {
          console.error("Error in customerRegister:", error);
          return res.status(500).json({ status: 0, message: "Internal Server Error" });
        }
      },

      UserLogin: async (req: Request, res: Response) => {
        try {
            const { email, password ,deviceToken,
            deviceType} = req.body;
            console.log(req.body, "BODY");
            
          
    
            // Validate user input
            if (!(email && password)) {
                return res.status(400).json({ status: 0, message: "All input is required." });
            }
    
            // Find user by email
            const user = await User.findOne({ where: { email } });
    
            if (!user) {
                return res.status(400).json({ status: 0, message: "Invalid Email" });
            }
            user.deviceToken = deviceToken,
            user.deviceType = deviceType         
            await user.save(); // Save the updated user object
    
            const isPasswordValid = await bcrypt.compare(password, user.password as unknown as string);
    
            if (!isPasswordValid) {
                return res.status(400).json({ status: 0, message: "Invalid Password" });
            }
    
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    // fullName: user.fullName,
                    email: user.email,
                },
                process.env.TOKEN_KEY as string, // Use your secret key stored in .env
            );
    
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
                    image:user.image,
                    iscompletedProfile:user.isCompletedProfile
    
    
                },
            });
        } catch (error) {
            // Handle unexpected errors
            console.error(error);
            return res.status(500).json({ status: 0, message: "Internal server error" });
        }
    },
 UserUpdate: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.log("User ID not found in request.");
      return res.status(400).json({ status: 0, message: 'User ID not found' });
    }

    let { FirstName, email, dob, interests } = req.body;
    const image = req.file?.path;

    // Parse interests if it's a string (e.g. from multipart/form-data)
    if (typeof interests === 'string') {
      try {
        interests = interests.split(',').map(item => item.trim());
      } catch (e) {
        console.warn("Failed to parse interests. Got:", interests);
        interests = [];
      }
    }

    // Clean and convert interests to numbers, removing invalid entries
    if (Array.isArray(interests)) {
      interests = interests
        .map((item: string | number) => {
          if (typeof item === 'string') {
            // Remove any surrounding brackets or non-numeric chars
            return parseInt(item.replace(/[\[\]]/g, ''), 10);
          }
          return item;
        })
        .filter((num: number) => !isNaN(num)); // Remove NaNs
    } else {
      interests = [];
    }

    console.log("Incoming data:", { FirstName, email, dob, interests, image });

    const user = await User.findOne({ where: { id: userId } });
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
    await user.save();
    console.log("User profile updated successfully.");

    if (interests.length > 0) {
      console.log("Processing interests...");

      // Step 1: Get existing interests
      const existingInterests = await Interests.findAll({ where: { userId } });
      const existingSubcategoryIds = existingInterests.map(i => i.subcategoryId);
      console.log("Existing interests:", existingSubcategoryIds);

      // Step 2: Filter new ones
      const newUniqueInterests = interests
        .filter((subcategoryId: number) => !existingSubcategoryIds.includes(subcategoryId))
        .map((subcategoryId: number) => ({
          subcategoryId,
          userId,
        }));

      console.log("New unique interests to add:", newUniqueInterests);

      // Step 3: Insert new interests
      if (newUniqueInterests.length > 0) {
        await Interests.bulkCreate(newUniqueInterests);
        console.log("New interests inserted successfully.");
      } else {
        console.log("No new interests to add.");
      }
    } else {
      console.log("No valid interests array provided.");
    }

    // Step 4: Fetch all updated interests
    const updatedInterests = await Interests.findAll({ where: { userId } });
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
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},





       
    ChangePass: async (req: Request, res: Response) => {
        try {
            const { oldPassword, newPassword } = req.body;
    
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ status: 0, message: 'Old and new passwords are required' });
            }
    
            if (oldPassword === newPassword) {
                return res.status(400).json({ status: 0, message: "New password cannot be the same as the old password" });
            }
    
            const user = await User.findByPk(req.user?.id);
            console.log(user,"USER GET");
            
    
            if (!user) {
                return res.status(404).json({ status: 0, message: 'User not found' });
            }
    
            const isValidPassword = await bcrypt.compare(oldPassword, user.password); // Ensure 'user.password' is a string
    
            if (!isValidPassword) {
                return res.status(400).json({ status: 0, message: 'Invalid old password' });
            }
    
            const hashedPassword = await bcrypt.hash(newPassword, 12);
    
            user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
            await user.save();
    
            return res.status(200).json({ status: 1, message: "Password changed successfully" });
        } catch (err: any) {
            console.error("Error:", err.message);
            return res.status(500).json({ status: 0, message: "Failed to change password" });
        }
    },
    SocialLogin: async (req: Request, res: Response) => {
        const {  email, socialType,socialId,FirstName} = req.body;
    
        try {
            // Check if user exists in the database based on email
            let user = await User.findOne({ where: { email } });
    
            if (user) {
                user.socialId = socialId;
                user.socialType = socialType;
               
                user.FirstName = FirstName ?? user.FirstName;
    
                // Save the updated user details
                await user.save();
    
                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.TOKEN_KEY as string, // Use your secret key stored in .env
                );
    
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
            } else {
                // If user doesn't exist, create a new user
                const newUser = await User.create({
                    email,
                    // fullName,
                    socialId,
                    socialType,
                    // deviceToken,
                    // deviceType,
                });
    
                // Generate JWT token for the new user
                const token = jwt.sign(
                    { userId: newUser.id, email: newUser.email },
                    process.env.TOKEN_KEY as string, // Use your secret key stored in .env
                );
    
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
        } catch (error) {
            console.error('Error during social login:', error);
    
            // Send error response
            return res.status(500).json({
                status: 0,
                message: 'Internal Server Error',
            });
        }
    },
    ForgetPassword: async (req: Request, res: Response) => {
        const email = req.body.email;
  
      try {
        // Step 1: Check if email exists in the database
        const user = await User.findOne({
          where: { email: email },
        });
  
        if (!user) {
          return res.status(400).json({ status: 0, message:'User not found' });
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
        
        await user.update({
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
        const transporter = nodemailer.createTransport({
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
        transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
          if (error) {
            return res.status(500).json({ status: 0, message: 'Failed to send OTP email' });
          }
          return res.status(200).json({ status: 1, message: 'OTP sent to email successfully' });
        });
  
      } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 0, message:'Internal Server Error' });
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
        const user = await User.findOne({ where: { email } });
    
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
        const user = await User.findOne({ where: { email } });
    
        if (!user) {
          return res.status(404).json({
            status: 0,
            message: 'User not found',
          });
        }
    
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();
    
        return res.status(200).json({
          status: 1,
          message: "Password updated successfully"
        });
    
      } catch (error: any) {
        console.error("Error updating password:", error); // Log actual error
    
        return res.status(500).json({
          status: 0,
          message: 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
      }
    },
    
    GetCategory: async (req: Request, res: Response) => {
      try {
        const categories = await Category.findAll();
      
        if (categories.length === 0) { 
          return res.status(404).json({ status: 0, message: 'No categories found' });
        }
        return res.status(200).json({ status: 1, message: 'Categories retrieved successfully', categories }); 

      } catch (error) {
        console.error('Error retrieving categories:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        
      }
    },
    GetSubcategory: async (req: Request, res: Response) => {
      try {
    const category_id = req.body.category_id;
  console.log(category_id,"category_id")
    const subcategories = await SubCategory.findAll({
      where: { category_id: category_id },
    });
    if (subcategories.length === 0) {
      return res.status(404).json({ status: 0, message: 'No subcategories found' });
    }
    res.status(200).json({ status: 1, message: 'Subcategories retrieved successfully', subcategories });


      } catch (error) {
        console.error('Error retrieving subcategories:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        
      }
    },
    CompleteProfile: async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    const { FirstName, gender, dob } = req.body;
    const image = req.file?.path;

    console.log(req.body, 'BODY>>>');

    // Parse interests
    let interestArray: number[] = [];
    if (req.body.Interests) {
      try {
        interestArray = JSON.parse(req.body.Interests);
        if (!Array.isArray(interestArray)) {
          return res.status(400).json({ message: 'Interests should be a JSON array' });
        }
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid format for Interests field' });
      }
    }

    const user = await User.findByPk(user_id, {
      attributes: ['id', 'FirstName', 'image', 'dob', 'gender', 'isCompletedProfile'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.FirstName = FirstName ?? user.FirstName;
    user.gender = gender ?? user.gender;
    user.dob = dob ?? user.dob;
    user.image = image ?? user.image;
    user.isCompletedProfile = true;
    await user.save();

    // Append new interests without deleting old ones
    if (interestArray.length > 0) {
      // Fetch existing interests
      const existingInterests = await Interests.findAll({ where: { userId: user_id } });
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
        await Interests.bulkCreate(newUniqueInterests);
        console.log('New interests added successfully:', newUniqueInterests);
      } else {
        console.log('No new interests to add.');
      }
    }

    // Send final response
    return res.json({
      status: 1,
      message: 'User updated successfully',
      user: {
        ...user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},

    GetProfile: async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
    
        if (!userId) {
          return res.status(400).json({ message: 'User ID is missing or invalid' });
        }
    
        const user = await User.findOne({
          where: { id: userId },
          attributes: ['id', 'FirstName', 'email', 'dob', 'image'],
          include: [
            {
              model: Interests,
              as: 'interests',
                        attributes: {
            exclude: ['createdAt', 'updatedAt']
          },


              include: [
                {
                  model: SubCategory,
                  as: 'subcategory',
                  include: [
                    {
                      model: Category,
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
    
      } catch (error) {
        console.error('Error retrieving profile:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
      }
    },
   AddPost: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    const {
      Title,
      GroupSize,
      Time,
      Description,
      Location,
      subcategoryId,
      Latitude,
      Longitude,
      IsOnRequest,
      IsAddAutomatically,
      isTodayOnly,
      isAvailablenow,
      ageRangeMax,
      ageRangeMin,
      endTime,
      date
    } = req.body;

    console.log(req.body, "<<<<<body>>>>");

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const image = req.file?.path;

    const AddPost = await Post.create({
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

      const distanceFormula = literal(`
        6371 * acos(
          cos(radians(${postLat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${postLng})) +
          sin(radians(${postLat})) * sin(radians(latitude))
        )
      `);

      let users = await User.findAll({
        where: {
          showNowAvailable: true,
          pushNotification:true,
          [Op.and]: sequelize.where(distanceFormula, { [Op.lte]: distanceKm })
        }
      });

      if (users.length === 0) {
        users = await User.findAll({
          where: {
            pushNotification: true,
            [Op.and]: sequelize.where(distanceFormula, { [Op.lte]: distanceKm })
          }
        });
      }

  for (const user of users) {
    await notificationQueue.add('send-now-available', {
      userId: user.id,
      title: 'Available Now!',
      message: `${Title} is happening near you!`,
      postId: AddPost.id.toString()
    });
  }

      console.log(`✅ Notifications sent to ${users.length} users.`);
    }

    // 🕒 Calculate end time for group
    let postEndAt: Date;

    try {
      postEndAt = new Date(new Date(AddPost.date).getTime() + 48 * 60 * 60 * 1000);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // 📌 Create Group
    await GroupMember.create({
      createdBy: userId ?? '',
      postId: AddPost.id,
      maxSize: GroupSize,
      endAt: postEndAt
    });

    res.status(200).json({
      status: 1,
      message: 'Post added successfully',
      data: AddPost
    });

  } catch (error) {
    console.error('Error adding post:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},

    GetPost: async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
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
    
        const posts = await Post.findAll({
          where: { userId },
          include: [
            {
                      model: GroupMember,
          as: 'groupMembers', // ✅ Fixed alias

              attributes: ['members']
            }
          ]
        });
    
        if (posts.length === 0) {
          return res.status(404).json({ status: 0, message: 'No posts found' });
        }
    
        const result = posts.map((post: any) => {
          const members = post.group?.members ?? [];
    
          // Post ki location
          const postLocation = {
            lat: parseFloat(post.Latitude),
            lon: parseFloat(post.Longitude),
          };
    
          // Distance calculate karenge (in meters), then convert to km
          const distanceInMeters = haversine(userLocation, postLocation);
          const distanceInKm = +(distanceInMeters / 1000).toFixed(2); // Rounded to 2 decimal places
    
          return {
            ...post.toJSON(),
            joinedCount: members.length,
            groupSize: post.GroupSize,
            distanceInKm
          };
        });
    
        return res.status(200).json({ status: 1, message: 'Posts retrieved successfully', data: result });
    
      } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
      }
    },
    DeletePost: async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
        const postId = req.body.id; // Assuming you're passing post ID as a URL parameter
        console.log(postId,"POST ID")
        
        if(!postId){
          return res.json({status:0,message:"Post id is required"})
        }        
        if (!userId) {
          return res.status(400).json({ message: 'User ID is missing or invalid' });
        }
    
        // Find the post to be deleted
        const post = await Post.findOne({ where: { id: postId, userId } });

    
        if (!post) {
          return res.status(404).json({ status: 0, message: 'Post not found' });
        }
    
        await GroupMember.destroy({ where: { postId } }); // Delete associated group members  

        // Delete the post
        await post.destroy();
    
        return res.status(200).json({ status: 1, message: 'Post deleted successfully' });
        
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        
      }
    },

UpdatePost: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const postId = req.body.id;


    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) {
      return res.status(404).json({ status: 0, message: 'Post not found' });
    }

    const group = await GroupMember.findOne({ where: { postId } });

    const {
      Title, GroupSize, Time, Description, Location, subcategoryId,
      Latitude, Longitude, IsOnRequest, IsAddAutomatically,
      isAvailablenow, isTodayOnly, ageRangeMax, ageRangeMin
    } = req.body;
    console.log(req.body, "BODY>>>"); 
    

    const image = req.file?.path;
    console.log(image, "IMAGE PATH");
    

    // Update fields if provided
    post.Title = Title ?? post.Title;
    post.GroupSize = GroupSize ?? post.GroupSize;
    post.Time = Time ?? post.Time;
    post.Description = Description ?? post.Description;
    post.Location = Location ?? post.Location;
    post.subcategoryId = subcategoryId ?? post.subcategoryId;
    post.Latitude = Latitude ?? post.Latitude;
    post.Longitude = Longitude ?? post.Longitude;
    post.image = image ?? post.image;
    post.IsOnRequest = IsOnRequest ?? post.IsOnRequest;
    post.IsAddAutomatically = IsAddAutomatically ?? post.IsAddAutomatically;
    post.isAvailablenow = isAvailablenow ?? post.isAvailablenow;
    post.isTodayOnly = isTodayOnly ?? post.isTodayOnly;
    post.ageRangeMin = ageRangeMin ?? post.ageRangeMin;
    post.ageRangeMax = ageRangeMax ?? post.ageRangeMax;

    await post.save();

    if (group?.members && Array.isArray(group.members)) {
      for (const member of group.members) {
        if (member.userId === group.createdBy) continue; // Skip creator

        const user = await User.findOne({ where: { id: member.userId } });

        if (user?.eventUpdate == true && user.pushNotification== true) {
          // Create in-app notification
          await Notification.create({
            userId: user.id,
            body: 'The host updated the Qes',
            type: 'eventUpdate',
            moduleId: post.id.toString(),
            senderId: group.createdBy,
            title: 'group update'
          });

          // Send push notification
          await notificationQueue.add('send-event-update', {
  userId: user.id,
  title: 'Group Update',
  message: 'The host updated the Qes',
  postId: post.id.toString()
});

        }
      }
    }

    return res.status(200).json({ status: 1, message: 'Post updated successfully', data: post });

  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},

    JoinGroup: async (req: Request, res: Response) => {
      try {
        const { postId } = req.body;
        const userId = req.user?.id?.toString();
    
        if (!userId) {
          return res.status(400).json({ message: 'User ID is missing or invalid' });
        }
    
        // Fetch user once
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
          return res.status(404).json({ status: 0, message: 'User not found' });
        }
    
        const group = await GroupMember.findOne({ where: { postId } });
        if (!group) {
          return res.status(404).json({ status: 0, message: 'Group not found' });
        }
    
        const post = await Post.findOne({ where: { id: postId } });
        if (!post) {
          return res.status(404).json({ status: 0, message: 'Post not found' });
        }
    
        const members: MemberDetail[] = group.members as MemberDetail[];
    
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
        const newMember: MemberDetail = { userId, status: memberStatus ,isArchive:true};
    
        const updatedMembers: MemberDetail[] = [...members, newMember];
        await group.update({ members: updatedMembers });
    
        const shouldNotify = isRequestRequired && Boolean(post.userId) && Boolean(user.pushNotification);
        if (shouldNotify) {
          await Notification.create({
            moduleId: postId,
            userId: post.userId,
            senderId: userId,
            title: "Join Request",
            body: `${user.FirstName} wants to be added to the group`,
          });
        }
           await notificationQueue.add('send-request-to-join', {
            userId: post.userId,
            title: 'Join Request',
            message:`${user.FirstName} wants to be added to the group`,
            postId: post.id.toString()
          });

    
        return res.status(200).json({
  status: isRequestRequired ? 1 : 2,
  message: isRequestRequired
    ? 'Request sent to the group admin'
    : 'Successfully joined the group',
});

    
      } catch (error) {
        console.error('Join Group Error:', error);
        return res.status(500).json({ status: 0, message: 'Internal server error' });
      }
    },
    
    
    AcceptRequest: async (req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
        const { id,postId, memberId, action } = req.body; // action = 'accept' | 'reject'
    
        if (!userId || !postId || !memberId || !action) {
          return res.status(400).json({ status: 0, message: 'Missing required fields' });
        }
    
        const membersData = await User.findOne({ where: { id: memberId } });
        const group = await GroupMember.findOne({ where: { postId } });
    
        if (!group) {
          return res.status(404).json({ status: 0, message: 'Group not found for this post' });
        }
    
        if (group.createdBy !== userId) {
          return res.status(403).json({ status: 0, message: 'Only the group creator can perform this action' });
        }
    
        const memberExists = group.members.some(
          (member: any) => member.userId === memberId && member.status === 'pending'
        );
        console.log(memberExists, "MEMBER EXISTS");
        
    
        if (!memberExists) {
          return res.status(404).json({ status: 0, message: 'Pending member not found' });
        }
    
        let updatedMembers;
    
        if (action === 'accept') {
          updatedMembers = group.members.map((member: any) =>
            member.userId === memberId ? { ...member, status: 'joined' } : member
          );
        } else if (action === 'reject') {
          updatedMembers = group.members.filter((member: any) => member.userId !== memberId);
        } else {
          return res.status(400).json({ status: 0, message: 'Invalid action type' });
        }
    
        await group.update({ members: updatedMembers });
    
        // Step 1: Set old "Join Request" notification isActive = false
    // Step 1: Find the active join request notification
const existingNotification = await Notification.findOne({
  where: {
    id:id
  }
});

// Step 2: If found, set isActive to false and save
if (existingNotification) {
  existingNotification.isActive = false;
  await existingNotification.save();
  console.log("Old notification updated with isActive = false");
} else {
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
    
        if (membersData?.pushNotification === true) {
          await Notification.create({
            type: notificationType,
            userId: memberId,
            senderId: userId,
            title: notificationTitle,
            body: notificationBody,
            moduleId: postId,
            isActive: true // Important to keep new notification active
          });
           await notificationQueue.add('send-accept-request', {
            userId: memberId,
            title: notificationTitle,
            message: notificationBody,
            postId: postId.toString()
          });

        }
    
        return res.status(200).json({
          status: 1,
          message: `Member request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
          data:{
            memberId,
            postId
          }
        });
    
      } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
      }
    },
    
    
RemoveFromGroup: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId, memberId } = req.body;
    console.log(req.body,"BODY");
    

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }
    const getMember = await User.findOne({where:{
      id:memberId
    }})

    const group = await GroupMember.findOne({ where: { postId } });

    if (!group) {
      return res.status(404).json({ status: 0, message: 'Group not found for this post' });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({ status: 0, message: 'Only the group creator can remove members' });
    }

    let members: MemberDetail[] = group.members as MemberDetail[];

    // Debug: Print current members
    console.log('Before removal, members:', members);

    // Trim ID for safety
    const cleanMemberId = memberId?.toString().trim();

    // Remove the member
    members = members.filter((member) => member.userId !== cleanMemberId);

    // Debug: Print members after filter
    console.log('After removal, members:', members);


      await group.update({ members });
      if (group?.members && Array.isArray(group.members)) {
        for (const member of group.members) {
          const user = await User.findOne({ where: { id: member.userId } });
  
          if (user?.id !== userId && user?.eventUpdate) {
            await Notification.create({
              userId: user.id,
              body: `Host has removed ${getMember?.FirstName} from the group`,
              type: 'eventUpdate',
              moduleId: postId,
              senderId:group.createdBy,
              title:"group update"
            });
        
  
          }
        }
      }
    
      return res.status(200).json({ status: 1, message: 'Member removed successfully' });

  } catch (error) {
    console.error('Error removing from group:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
LeftFromGroup: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }
    const group = await GroupMember.findOne({ where: { postId } });
    if (!group) {
      return res.status(404).json({ status: 0, message: 'Group not found for this post' });
    }
    let members: MemberDetail[] = group.members as MemberDetail[];
    const users = await User.findOne({where:{
      id:userId
    }})
    console.log('Before removal, members:', members);
    const cleanUserId = userId?.toString().trim();
    members = members.filter((member) => member.userId !== cleanUserId);
    console.log('After removal, members:', members);
    await group.update({ members });
    if (group?.members && Array.isArray(group.members)) {
      for (const member of group.members) {
        const user = await User.findOne({ where: { id: member.userId } });

        if (user?.id !== userId && user?.eventUpdate) {
          await Notification.create({
            userId: user.id,
            body: `${users?.FirstName} has left the group`,
            type: 'eventUpdate',
            moduleId: postId,
            senderId:group.createdBy,
            title:"group update"
          });
      

        }
      }
    }
    return res.status(200).json({ status: 1, message: 'Left group successfully' });


  } catch (error) {
    console.error('Error leaving group:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
    
  }
},
ReportMember: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId, memberId,reason } = req.body; // Assuming you're passing post ID and member ID as request body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    // Find the group associated with the post
    const group = await GroupMember.findOne({ where: { postId } });

    if (!group) {
      return res.status(404).json({ status: 0, message: 'Group not found for this post' });
    }
console.log(group,"GROUP");


const memberIds = group.members.map(m => m.userId); // adjust based on your structure
if (!memberIds.includes(memberId)) {
  return res.status(404).json({ status: 0, message: 'Member not found in the group' });
}
console.log(memberId,"MEMBER ID");


  await Report.create({
      reporterId: userId,
      reportedId: memberId,
      groupId: group.id,
      postId: postId,
      reason:reason
    });

    // Logic to report the member (e.g., save to database, notify admin, etc.)
    // For now, just return success response
    return res.status(200).json({ status: 1, message: 'Member reported successfully' });

  } catch (error) {
    console.error('Error reporting member:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });


  }
},
AddcustomerService: async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { email, FirstName, phoneNumber, subject, Description } = req.body;

  try {
    if (!email || !FirstName || !subject) {
      return res.status(400).json({ status: 0, message: 'All input is required' });
    }

    await customerService.create({
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

  } catch (error: any) {
    console.error('AddcustomerService Error:', {
      message: error.message,
      stack: error.stack,
      details: error
    });

    // Optional: respond differently based on the environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    return res.status(500).json({
      status: 0,
      message: 'Internal Server Error',
      ...(isDevelopment && { error: error.message })
    });
  }
}
,
HomePage: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log(userId, "USER");

    const Users = await User.findOne({ where: { id: userId } });

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
      ? sequelize.literal(`
          (${Users.ageRangeMin} <= "Post"."ageRangeMax" AND ${Users.ageRangeMax} >= "Post"."ageRangeMin")
        `)
      : sequelize.literal('TRUE');

    const posts = await Post.findAll({
      where: {
        userId: { [Op.ne]: userId },
        date: today,
        [Op.and]: [
          // Distance filter with proper casting
          sequelize.literal(`
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
        [sequelize.literal(`
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
          model: GroupMember,
          as: 'groupMembers',
          where: {
            endAt: { [Op.gte]: new Date(today) }
          },
          required: true,
          attributes: ['members', 'endAt'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'FirstName', 'image', 'showNowAvailable'],
        },
      ],
      order: [
        ['isAvailablenow', 'DESC'],
        // Distance ordering with proper casting
        [sequelize.literal(`
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

    const result = posts.map((post: any) => {
      const groupMemberEntries = post.groupMembers ?? [];

      let isJoined = 1;
      let joinedCount = 0;

      groupMemberEntries.forEach((gm: any) => {
        if (Array.isArray(gm.members)) {
          gm.members.forEach((m: any) => {
            if (m.userId === String(userId)) {
              if (m.status === 'pending') {
                isJoined = 3;
              } else {
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

  } catch (error) {
    console.error('Error retrieving posts:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},





PostDetails: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude, id } = req.body;

    const posts = await Post.findAll({
      where: {
        id: id,
        [Op.and]: sequelize.literal(`
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
        [sequelize.literal(`
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
          model: GroupMember,
          as: 'groupMembers',
          attributes: ['members'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'FirstName', 'image', 'showNowAvailable'],
        },
      ],
      order: sequelize.literal('distance ASC'),
    });

    const result = posts.map((post: any) => {
      let members = post.groupMembers?.map((gm: any) => gm.members).flat();

      if (typeof members === 'string') {
        try {
          members = JSON.parse(members);
        } catch {
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

  } catch (error) {
    console.error("Post details Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
,
MapData: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const UserRangeinKm = await User.findOne({
      where: { id: userId }
    });

    if (!UserRangeinKm) {
      return res.status(404).json({ status: 0, message: 'User not found' });
    }

    const { latitude, longitude } = req.body;
    const range = UserRangeinKm?.maxDistanceKm || 15;

    if (!latitude || !longitude) {
      return res.status(400).json({ status: 0, message: 'Latitude and longitude are required' });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const rangeNum = Number(range);

    const posts = await Post.findAll({
      where: {
        userId: { [Op.ne]: userId },
        [Op.and]: sequelize.literal(`
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
        [sequelize.literal(`
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
          model: GroupMember,
          as: 'groupMembers',
          required: false,
          attributes: ['members'],
        }
      ],
      order: [[sequelize.literal('distance'), 'ASC']],
    });

    const result = posts.map((post: any) => {
      const groupMemberEntries = post.groupMembers ?? [];
      let isJoined = false;
      let joinedCount = 0;

      groupMemberEntries.forEach((gm: any) => {
        if (Array.isArray(gm.members)) {
          gm.members.forEach((m: any) => {
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

  } catch (error) {
    console.error("MapData Error:", error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
}

,

postGroupDetails: async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    console.log(id, "id");

    const postGroupDetails = await Post.findAll({
      where: { id },
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

    console.log(postGroupDetails, "POST DETAILS");

    res.json({ status: 1, message: "Group details Fetched", data: postGroupDetails });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
},

GetSettingNotification: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ status: 0, message: 'User ID is missing or invalid' });
    }

    const userSettings = await User.findOne({
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

  } catch (error) {
    console.error('GetSettingNotification Error:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
UpdateSettingNotification: async (req: Request, res: Response) => {
  try {
    // Extract user ID from the request object (assuming authenticated user)
    const id = req.user?.id;

    // Validate if user ID is provided
    if (!id) {
      return res.status(400).json({ status: 0, message: 'User ID is missing or invalid' });
    }

    // Destructure request body
    const {
      reportNotification,
      inAppVibration,
      inAppSound,
      latitude,
      showNowAvailable,

      longitude,
      minDistanceKm,
      maxDistanceKm,
      ageRangeMin,
      ageRangeMax,
      pushNotification,
      eventUpdate,
      memories,
    } = req.body;
console.log(req.body,"BODY");

    // Find the user by primary key (id)
    let user = await User.findByPk(id);

    // If user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({ status: 0, message: 'User not found' });
    }

    // Update user settings using nullish coalescing (??) to keep existing values if not provided
    user.reportNotification = reportNotification ?? user.reportNotification;
    user.inAppVibration = inAppVibration ?? user.inAppVibration;
    user.inAppSound = inAppSound ?? user.inAppSound;
    user.latitude = latitude ?? user.latitude;
    user.longitude = longitude ?? user.longitude;
    user.maxDistanceKm = maxDistanceKm ?? user.maxDistanceKm;
    user.minDistanceKm = minDistanceKm ?? user.minDistanceKm;
    user.ageRangeMax = ageRangeMax ?? user.ageRangeMax;
    user.ageRangeMin = ageRangeMin ?? user.ageRangeMin;
    user.pushNotification = pushNotification ?? user.pushNotification;
    user.eventUpdate = eventUpdate ?? user.eventUpdate;
    user.memories = memories ?? user.memories;
    user.showNowAvailable = showNowAvailable ?? user.showNowAvailable;

    // Save updated user settings
    await user.save();
    console.log(user,"USER");
    

    // Return success response
    res.json({ status: 1, message: 'Notification settings updated successfully' });
  } catch (error) {
    // Log the error for debugging
    console.error('Error updating notification settings:', error);

    // Return a generic error message, while sending the error message to logs
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
GetNotification: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Pehle saare notifications la lo
    const notifications = await Notification.findAll({
      where: {
        userId: userId,
        isActive: true //
      },
      order: [['createdAt', 'DESC']] // Add this line

    });

    const updatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        // Sender ki detail lao
        const sender = await User.findOne({
          where: { id: notification.senderId },
          attributes: ['image','FirstName']
        });

        return {
          ...notification.toJSON(), 
          senderImage: sender?.image || null ,
          senderName: sender?.FirstName || null,
        };
      })
    );

    res.json({ status: 1, message: "Notification fetched successfully", data: updatedNotifications });

  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},

GetAllSubcategory:async (req:Request,res:Response) =>{
  try {
    const GetAllSubcategory = await SubCategory.findAll({attributes:['id','Name','image','category_id']})
    res.json({status:1,message:"subcategory get successfully",data:GetAllSubcategory})
    
  } catch (error) {
    console.error('Error updating notification settings:', error);

    // Return a generic error message, while sending the error message to logs
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
  


},
GetMyProfile: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ status: 0, message: 'User ID not found' });
    }

    // Get User basic data
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['FirstName', 'email', 'image', 'dob']
    });

    if (!user) {
      return res.status(404).json({ status: 0, message: 'User not found' });
    }

    // Get all user interests (subcategoryId)
    const userInterests = await Interests.findAll({
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
    const subcategories = await SubCategory.findAll({
      where: { id: subcategoryIds },
      include: [
        {
          model: Category,
          as: 'Category', // IMPORTANT: use alias if association has alias
          attributes: ['id', 'Name']
        }
      ],
      attributes: ['id', 'Name', 'image', 'category_id']
    });

    // Organize by category
    const interestsMap: { [key: number]: any } = {};

    subcategories.forEach((subcat: any) => {
      const categoryId = subcat.category_id;
      const categoryName = subcat.Category?.Name || '';

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

  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},

CancelPost: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const postId = req.body.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }

    // Find the post
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ status: 0, message: 'Post not found' });
    }

    // Find the associated group
    const group = await GroupMember.findOne({ where: { postId } });
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
        const user = await User.findOne({ where: { id: member.userId } });
        if (!user) continue; // Skip if user not found

        // Send notification (excluding self if desired)
      const sendPushNotification = await Notification.create({
          userId: user.id,
          body: 'The host cancelled the Qes',
          type: 'eventUpdate',
          moduleId: post.id.toString(),
          senderId: group.createdBy,
          title: 'Group Update',
        });
        console.log(sendPushNotification,"SEND PUSH NOTIFICATION");
        
        // Optional: Push notification logic
        // await sendPushNotification(user.deviceToken, 'The host cancelled the Qes');
      }
    }

    // Delete the post and group
    await post.destroy();
    await group.destroy();

    return res.status(200).json({ status: 1, message: 'Post cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling post:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
ArchiveGroup:async(req:Request,res:Response)=>{
   try {
    const userId = req.user?.id;

    // End of today to include today in comparison
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Fetch expired groups with the associated post
    const expiredGroups = await GroupMember.findAll({
      where: {
        endAt: {
          [Op.lte]: endOfToday, // Group's end date is today or before
        },
      },
       include: [
    {
      model: Post,
      as: 'post', // Make sure the alias matches
      required: true, // Ensures you only get groups with associated posts
    },
  ],
    });

    console.log(expiredGroups, "<<<<<EXPIRES>>>>");

    res.status(200).json({ status: 1,messaege:"Archive Group get succesfully", data: expiredGroups });
  } catch (error) {
    console.error('Error fetching archived groups:', error);
    res.status(500).json({ status: 0, message: 'Something went wrong' });
  }


},
RecreateGroupFromArchive: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ status: 0, message: "User not found" });
    }

    const {
      oldPostId,
      Title,
      GroupSize,
      Time,
      Description,
      Location,
      subcategoryId,
      Latitude,
      Longitude,
      IsOnRequest,
      IsAddAutomatically,
      isTodayOnly,
      isAvailablenow,
      ageRangeMax,
      ageRangeMin,
      endTime,
      date
    } = req.body;

    if (!oldPostId || !date) {
      return res.status(400).json({ status: 0, message: 'oldPostId and date are required' });
    }

    const image = req.file?.path;

    // 1. Get old group for members
    const oldGroup = await GroupMember.findOne({ where: { postId: oldPostId } });
    if (!oldGroup) {
      return res.status(404).json({ status: 0, message: 'Archived group not found' });
    }

    // 2. Create new post
    const newPost = await Post.create({
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
    const joinedMembers = oldGroup.members.filter((member: any) => member.status === 'joined');
    const joinedUserIds = joinedMembers.map((member: any) => member.userId);

    // 5. Create new group with only joined members
    const newGroup = await GroupMember.create({
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
        newGroup: {
          ...newGroup.toJSON(),
          members: joinedUserIds
        }
      }
    });

  } catch (error) {
    console.error('Error recreating group:', error);
    res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
DeleteInterests: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const  subcategoryId = req.body.subcategoryId;

    if (!userId || !subcategoryId) {
      return res.status(400).json({ status: 0, message: 'User ID or subcategory ID is missing' });
    }

    // Check if the interest exists
    const interest = await Interests.findOne({
      where: { userId, subcategoryId }
    });

    if (!interest) {
      return res.status(404).json({ status: 0, message: 'Interest not found' });
    }

    // Delete the interest
    await interest.destroy();

    return res.status(200).json({ status: 1, message: 'Interest deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting interests:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

    
  }
},
RecentQess: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ status: 0, message: 'User ID or location is missing' });
    }

    // GroupMember logic same as before
    const groupMemberRecords = await GroupMember.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['postId', 'members'],
      limit: 1
    });

    const joinedPostIds: number[] = [];
    for (const record of groupMemberRecords) {
      const members = record.members || [];
      const matchedMember = members.find((m: any) =>
        m.userId === userId && m.status === 'joined' && m.isArchive === false
      );
      if (matchedMember) {
        joinedPostIds.push(record.postId);
      }
    }

    // ✅ Step 1: Get posts (without association)
    const recentQes = await Post.findAll({
      where: {
        [Op.or]: [
          { userId },
          { id: { [Op.in]: joinedPostIds } }
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
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'image']
    });

    const userImageMap: Record<string, string> = {};
    users.forEach(user => {
      userImageMap[user.id] = user.image;
    });

    // ✅ Step 4: Enrich post data
const enrichedQes = recentQes.map(post => {
  const distanceInKm = getDistanceFromLatLonInKm(
    latitude,
    longitude,
    Number(post.Latitude),
    Number(post.Longitude)
  );

  // Find related group members for this post
  const gmEntry = groupMemberRecords.find(gm => gm.postId === post.id);

  let isJoined = 1; // 1 = not joined, 2 = joined, 3 = pending
  let joinedCount = 0;

  if (gmEntry && Array.isArray(gmEntry.members)) {
    gmEntry.members.forEach((m: any) => {
      if (m.status === 'joined') {
        joinedCount++;
      }

      if (m.userId === String(userId)) {
        if (m.status === 'pending') {
          isJoined = 3;
        } else if (m.status === 'joined') {
          isJoined = 2;
        }
      }
    });
  }

  return {
    ...post.toJSON(),
    distanceInKm,
    creatorImage: userImageMap[post.userId] || null,
    isJoined,
    joinedCount
  };
});


    return res.status(200).json({
      status: 1,
      message: 'Recent Qes fetched successfully',
  data: enrichedQes[0] || null  // single object
    });

  } catch (error) {
    console.error('Error fetching recent Qes:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
}





}

