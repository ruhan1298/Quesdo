import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import hbs from "handlebars";

import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import sequelize, { Category, Group, SubCategory } from "../../model";
import { Op } from "sequelize";
import Interests from "../models/Interests";
import Post from "../models/post";
import Report from "../models/Report";
import customerService from "../models/customerService";
import GroupMember from "../models/GroupMember";
import Notification from "../models/Notification";

const templatePath = path.join(__dirname, '../../views/otptemplate.hbs');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = hbs.compile(source);
interface MemberDetail {
  userId: string;
  status: 'pending' | 'joined';
}

export default {

    UserRegister: async (req: Request, res: Response) => {
        try {
          const {  password, email } = req.body;
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
            email
        
          });
    
          // Generate JWT token
          const token = jwt.sign(
            {
              user_id: newUser.id,
              email: newUser.email,
            },
            process.env.TOKEN_KEY as string,
            { expiresIn: "2h" } // Token expiration time
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
            const { email, password } = req.body;
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
            // Get user_id from the request
            const user_id = req.user?.id;
            if (!user_id) {
                return res.status(400).json({ message: 'User ID is missing or invalid' });
            }
    
            // Get the updated user data from the request body
            const { FirstName, email,dob,gender } = req.body;
    
    console.log(req.body,"boDY");
    const image = req.file?.path; // Normalize path
    
            let user = await User.findByPk(user_id);
    
      
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
                // Update the user's information
          user.FirstName = FirstName ?? user.FirstName;
          user.email = email ?? user.email;
          user.dob = dob ?? user.dob;
          user.image= image ?? user.image
          user.gender = gender ?? user.gender
          // user.Interests = interests || user.Interests


          await user.save();
    
            // Return success response with the updated user data
            res.json({ status:1,message: 'User updated successfully', user });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
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
               
                user.FirstName = FirstName || user.FirstName;
    
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
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expiration in 10 minutes
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
    
        user.password = hashedPassword; // Ensure 'hashedPassword' type matches 'user.password'
        await user.save();
    
        return res.status(200).json({ status: 1, message: "Password update successfully" });
      
      } catch (error) {
        return res.status(500).json({
          status: 0,
          message: 'Internal Server Error',
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
    
        // 👇 Parse Interests from form-data
        let interestArray: number[] = [];
        if (req.body.Interests) {
            interestArray = JSON.parse(req.body.Interests);
            if (!Array.isArray(interestArray)) {
              return res.status(400).json({ message: 'Interests should be a JSON array' });
            }
       
        }
    
        const user = await User.findByPk(user_id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // ✅ Basic profile update
        user.FirstName = FirstName ?? user.FirstName;
        user.gender = gender ?? user.gender;
        user.dob = dob ?? user.dob;
        user.image = image ??user.image;
        user.isCompletedProfile = true;
    
        await user.save();
    
        // ✅ Handle Interests
        if (interestArray.length > 0) {
          // 1. Delete old interests
          await Interests.destroy({ where: { userId: user_id } });
    
          // 2. Prepare and insert new interests
          const newInterests = interestArray.map((subcategoryId: number) => ({
            userId: (user_id), // 🔁 Ensure it's a number if needed
            subcategoryId,
          }));
    
          await Interests.bulkCreate(newInterests);
          console.log("Interests added successfully", newInterests);
        }
    
        return res.json({
          status: 1,
          message: 'User updated successfully',
          user,
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
          include: [
            {
              model: Interests,
              as: 'interests',
              include: [
                {
                  model: SubCategory,
                  as: 'subcategory',
                  include: [
                    {
                      model: Category,
                      as: 'category',
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
        const { Title, GroupSize, Time, Description, Location, subcategoryId, Latitude, Longitude,IsOnRequest,IsAddAutomatically,IsBosted} = req.body;
        const image = req.file?.path; // Normalize path

        console.log(req.body, "BODY");
        console.log(userId, "USER ID");
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
          IsBosted
        })
   const AddGroup = await Group.create({
          createdBy: userId,
          postId: AddPost.id,
          maxSize: GroupSize, // Ensure GroupSize is defined and matches the required type
   })
        res.status(200).json({
          status: 1,
          message: 'Post added successfully',
              
        })

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
    
        const posts = await Post.findAll({
          where: { userId },
          include: [
            {
              model: Group,
              as: 'group', // must match Post.hasOne(GroupMember, { as: 'group' })
              attributes: ['members']
            }
          ]
        });
    
        if (posts.length === 0) {
          return res.status(404).json({ status: 0, message: 'No posts found' });
        }
    
        // Transform data to include joinedCount
        const result = posts.map((post: any) => {
          const members = post.group?.members || [];
          return {
            ...post.toJSON(),
            joinedCount: members.length,
            groupSize: post.GroupSize
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
    
        // Delete the post
        await post.destroy();
    
        return res.status(200).json({ status: 1, message: 'Post deleted successfully' });
        
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        
      }
    },
    UpdatePost:async(req: Request, res: Response) => {
      try {
        const userId = req.user?.id;
        const postId = req.body.id; // Assuming you're passing post ID as a URL parameter
    
        if (!userId) {
          return res.status(400).json({ message: 'User ID is missing or invalid' });
        }
    
        // Find the post to be updated
        const post = await Post.findOne({ where: { id: postId, userId } });
    
        if (!post) {
          return res.status(404).json({ status: 0, message: 'Post not found' });
        }
        const group = await Group.findOne({ where: { postId } });

    
        // Update the post with new data
        const { Title, GroupSize, Time, Description, Location, subcategoryId, Latitude, Longitude,IsOnRequest,IsAddAutomatically,IsBosted} = req.body;
        const image = req.file?.path; // Normalize path
    
        post.Title = Title ?? post.Title;
        post.GroupSize = GroupSize ?? post.GroupSize;
        post.Time = Time ?? post.Time;
        post.Description = Description ?? post.Description;
        post.Location = Location ?? post.Location;
        post.subcategoryId = subcategoryId ?? post.subcategoryId;
        post.Latitude = Latitude ?? post.Latitude;
        post.Longitude = Longitude ??post.Longitude;
        post.image = image ?? post.image; // Update image only if provided
        post.IsOnRequest = IsOnRequest ?? post.IsOnRequest;
        post.IsAddAutomatically = IsAddAutomatically ?? post.IsAddAutomatically;
        post.IsBosted = IsBosted ?? post.IsBosted;
        await post.save();

        if (group?.members && Array.isArray(group.members)) {
          for (const member of group.members) {
            const user = await User.findOne({ where: { id: member.userId } });
    
            if (user?.eventUpdate) {
              // Assuming you have a Notification model or a function to send notifications
              await Notification.create({
                userId: user.id,
                body: 'The host updated the Qes',
                type: 'eventUpdate',
                moduleId: post.id.toString(),
                senderId:group.createdBy,
                title:"group update"
              });
    
              // Optionally, send a push notification too
              // await sendPushNotification(user.deviceToken, 'The host updated the Qes');
            }
          }
        }


    
        return res.status(200).json({ status: 1, message: 'Post updated successfully', data:post });
        
      } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
        
      }
    },
    JoinGroup: async (req: Request, res: Response) => {
      try {
        const { postId } = req.body;
        const userId = req.user?.id ? req.user.id.toString() : null;
    
        if (!userId) {
          return res.status(400).json({ message: 'User ID is missing or invalid' });
        }
        const users = await User.findOne({where:{
          id:userId
        }})
    
        // Find the group by postId
        const group = await Group.findOne({ where: { postId } });
        if (!group) {
          return res.status(404).json({ status: 0, message: 'Group not found' });
        }
    
        // Find the related post
        const post = await Post.findOne({ where: { id: postId } });
        if (!post) {
          return res.status(404).json({ status: 0, message: 'Post not found' });
        }
        const postedUser = await User.findOne({where:{
          id:userId
        }})
    
        const members: MemberDetail[] = group.members as MemberDetail[];
    
        // Check if already a member or requested
        if (members.some((member) => member.userId === userId)) {
          return res.status(400).json({ status: 0, message: 'Already joined or requested' });
        }
    
        // Check if group is full
        if (members.length >= group.maxSize) {
          return res.status(400).json({ status: 0, message: 'Group is full' });
        }
    
        // Determine status: 'pending' if isOnRequest is true, otherwise 'joined'
        const memberStatus = post.IsOnRequest ? 'pending' : 'joined';
        const newMember: MemberDetail = { userId, status: memberStatus };
    
        const updatedMembers: MemberDetail[] = [...members, newMember];
        await group.update({ members: updatedMembers });
    
        // Optionally notify the post creator (createdBy) if it’s a request
        if (post.IsOnRequest && post.userId && postedUser?.pushNotification == true) {
         await Notification.create({
          moduleId:postId,
          userId:post.userId,
          senderId:userId,
          title:"Join Request",
          body:`${users?.FirstName} Wants to be added to the group 
`        

        })
        }
    
        return res.status(200).json({
          status: 1,
          message: post.IsOnRequest
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
        const { postId, memberId, action } = req.body; // action = 'accept' | 'reject'
    
        if (!userId || !postId || !memberId || !action) {
          return res.status(400).json({ status: 0, message: 'Missing required fields' });
        }
    const membersData = await User.findOne({where:{
      id:memberId
    }})
        const group = await Group.findOne({ where: { postId } });
    
        if (!group) {
          return res.status(404).json({ status: 0, message: 'Group not found for this post' });
        }
    
        if (group.createdBy !== userId) {
          return res.status(403).json({ status: 0, message: 'Only the group creator can perform this action' });
        }
    
        const memberExists = group.members.some(
          (member: any) => member.userId === memberId && member.status === 'pending'
        );
    
        if (!memberExists) {
          return res.status(404).json({ status: 0, message: 'Pending member not found' });
        }
    
        let updatedMembers;
    
        if (action === 'accept') {
          updatedMembers = group.members.map((member: any) =>
            member.userId === memberId ? { ...member, status: 'joined' } : member
          );
        } else if (action === 'reject') {
          // Option 1: Remove member entirely
          updatedMembers = group.members.filter((member: any) => member.userId !== memberId);
    
          // Option 2: Keep record and update status to 'rejected'
          // updatedMembers = group.members.map((member: any) =>
          //   member.userId === memberId ? { ...member, status: 'rejected' } : member
          // );
        } else {
          return res.status(400).json({ status: 0, message: 'Invalid action type' });
        }
    
        await group.update({ members: updatedMembers });
    
        const notificationType = action === 'accept' ? 'Accept Request' : 'Reject Request';
        const notificationTitle =
          action === 'accept' ? 'Group Join Request Accepted' : 'Group Join Request Rejected';
        const notificationBody =
          action === 'accept'
            ? 'Group Admin has added you into the group'
            : 'Your request to join the group has been rejected by the admin';
            if (membersData?.pushNotification == true) {

        await Notification.create({
          type: notificationType,
          userId: memberId,
          senderId: userId,
          title: notificationTitle,
          body: notificationBody,
          moduleId: postId
        });
    
      }
        return res.status(200).json({
          status: 1,
          message: `Member request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
        });
      } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
      }},
RemoveFromGroup: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { postId, memberId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing or invalid' });
    }
    const getMember = await User.findOne({where:{
      id:memberId
    }})

    const group = await Group.findOne({ where: { postId } });

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
    const group = await Group.findOne({ where: { postId } });
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
    const group = await Group.findOne({ where: { postId } });

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
  try {
    const userId = req.user?.id
    const { email, FirstName, phoneNumber, subject,Description } = req.body;
    console.log(req.body, "BODY");

    // Validate required fields
    if (!email || !FirstName || !subject) {
      return res.status(400).json({ status: 0, message: 'All input is required' });
    }

    // Create customer service request
     await customerService.create({
      userId,
      email,
      name: FirstName,
      phoneNumber,
      subject,
      Description
    });

    return res.status(200).json({ status: 1, message: 'Customer service request added successfully' });
  } catch (error) {
    console.error('Error adding customer service request:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
HomePage: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { latitude, longitude } = req.body; // User's current location

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ message: 'User ID or location is missing' });
    }

    const posts = await Post.findAll({
      where: {
        userId: { [Op.ne]: userId},
        [Op.and]: sequelize.literal(`

          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(latitude))
            )
          ) <= 50
        `)
      },
      attributes: [
        'id', 'Title', 'GroupSize', 'Location', 'Time', 'image',
        [sequelize.literal(`
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(latitude))
            )
          )
        `), 'distance']
      ],
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
      order: sequelize.literal('distance ASC'),
    });

    const result = posts.map((post: any) => {
      const members = post.group?.members ?? [];
      const isJoined = members.some((member: any) => member.userId === userId);
      const distance = parseFloat(post.get('distance')).toFixed(1); // in km
      // const timeAgo = dayjs(post.Time).fromNow(); // e.g. "58 minutes ago"

      return {
        ...post.toJSON(),
        joinedCount: members.length,
        groupSize: post.GroupSize,
        isJoined,
        distance: `${distance} km`,
        // timeAgo,
      };
    });

    if (result.length === 0) {
      return res.status(404).json({ status: 0, message: 'No posts found within 50km' });
    }

    return res.status(200).json({ status: 1, message: 'Posts retrieved successfully', data: result });

  } catch (error) {
    console.error('Error retrieving posts:', error);
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });
  }
},
PostDetails: async (req:Request,res:Response) =>{
  try {
    const userId = req.user?.id;
    const { latitude, longitude,id} = req.body; // User's current location

    const posts = await Post.findAll({
      where: {
        id:id,
        [Op.and]: sequelize.literal(`

          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(latitude))
            )
          ) <= 50
        `)
      },
      attributes: [
        'id', 'Title', 'GroupSize', 'Location', 'Time', 'image','Description',
        [sequelize.literal(`
          (
            6371 * acos(
              cos(radians(${latitude})) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(${longitude})) +
              sin(radians(${latitude})) * sin(radians(latitude))
            )
          )
        `), 'distance']
      ],
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
      order: sequelize.literal('distance ASC'),
    });

    const result = posts.map((post: any) => {
      const members = post.group?.members ?? [];
      const isJoined = members.some((member: any) => member.userId === userId);
      const distance = parseFloat(post.get('distance')).toFixed(1); // in km
      // const timeAgo = dayjs(post.Time).fromNow(); // e.g. "58 minutes ago"

      return {
        ...post.toJSON(),
        joinedCount: members.length,
        groupSize: post.GroupSize,
        isJoined,
        distance: `${distance} km`,
        // timeAgo,
      };
    });

    if (result.length === 0) {
      return res.status(404).json({ status: 0, message: 'No posts found within 50km' });
    }

    return res.status(200).json({ status: 1, message: 'Posts retrieved successfully', data: result });


  } catch (error) {
  return res.status(500).json({
          status: 0,
          message: 'Internal Server Error',
        });

    
  }
},
MapData: async (req:Request,res:Response)=>{
  try {
    const userId = req.user?.id
    const { latitude, longitude } = req.body;
const range = 50; // fixed to 5 km

const posts = await Post.findAll({
  where: {
    userId: { [Op.ne]: userId },
    [Op.and]: sequelize.literal(`
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      ) <= ${range}
    `)
  },
  attributes: [
    'id', 'Title', 'Location', 'image',
    [sequelize.literal(`
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(latitude))
        )
      )
    `), 'distance']
  ],
  order: [[sequelize.literal('distance'), 'ASC']],

   })
    posts.map((post: any) => {
    const members = post.group?.members || [];
    const isJoined = members.some((member: any) => member.userId === userId);
    const distance = parseFloat(post.get('distance')).toFixed(1); // in km
    // const timeAgo = dayjs(post.Time).fromNow(); // e.g. "58 minutes ago"

    return {
      ...post.toJSON(),
      joinedCount: members.length,
      groupSize: post.GroupSize,
      isJoined,
      distance: `${distance} km`,
    };
  });

   // const distance = parseFloat(posts.get('distance')).toFixed(1); // in km
   
   // return {
   //   ...posts
   //   // joinedCount: members.length,
   //   // groupSize: post.GroupSize,
   //   // isJoined,
   //   distance: `${distance} km`,
   //   // timeAgo,
   // };
   res.json({status:1,message :"Nearby Post get succsessfully", data:posts
   })
   
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

    
  }

},

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
    const userId= req.user?.id
    const GetSettingNotification= await User.findAll({
      where:{
        id:userId
      },
      attributes:['id',"reportNotification","inAppVibration","inAppSound","latitude","longitude","minDistanceKm","maxDistanceKm","ageRangeMin","ageRangeMax","pushNotification","eventUpdate","memories"]
    })
    res.json({
      status:1,
      message:"Notification setting get successfiully",
     data:GetSettingNotification
    })
    
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

  }
},
UpdateSettingNotification: async (req: Request, res: Response) => {
  try {
    const id = req.user?.id
    const {
      reportNotification,
      inAppVibration,
      inAppSound,
      latitude,
      longitude,
      minDistanceKm,
      maxDistanceKm,
      ageRangeMin,
      ageRangeMax,
      pushNotification,
      eventUpdate,
      memories,
    } = req.body;
    let user = await User.findByPk(id);
    
      
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }


    user.reportNotification = reportNotification || user.reportNotification;
    user.inAppVibration = inAppVibration || user.inAppVibration;
    user.inAppSound = inAppSound || user.inAppSound;
    user.latitude = latitude || user.latitude;
    user.longitude = longitude || user.longitude;
    user.maxDistanceKm = maxDistanceKm || user.maxDistanceKm
    user.minDistanceKm =minDistanceKm || user.minDistanceKm;
user.ageRangemax =  ageRangeMax || user.ageRangemax 
user.ageRangeMin = ageRangeMin  ||user.ageRangeMin
user.pushNotification = pushNotification  ||user.pushNotification
user.eventUpdate = eventUpdate  ||user.eventUpdate
user.memories= memories  ||user.memories






await user.save();


res.json({status:1, message:"Notification update successfully"})

    
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

  }
},
GetNotification :async (req:Request,res:Response)=>{
  try {
    const userId = req.user?.id
    const GetNotification = await Notification.findAll({
      where:{
        userId:userId
      }
    })
    res.json({status:1,message:"Notification get successfully",data:GetNotification})
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

    
  }
},
GetAllSubcategory:async (req:Request,res:Response) =>{
  try {
    const GetAllSubcategory = await SubCategory.findAll({attributes:['id','Name','image','category_id']})
    res.json({status:1,message:"subcategory get successfully",data:GetAllSubcategory})
    
  } catch (error) {
    return res.status(500).json({ status: 0, message: 'Internal Server Error' });

  }


}
}
// function template(emailData: { companyName: string; firstName: string; action: string; otp: string; otpExpiry: string; }) {
//     throw new Error("Function not implemented.");
// }