// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../model';
import { Json } from 'sequelize/types/utils';
interface UserAttributes {
  id?: string; // Use string type for UUID
  FirstName?: string;
  image?: string;
  email?:string;
  mobilenumber?:string
  password?:string
  isCompletedProfile?:boolean
//   role?:string
dob?:Date
gender?:string

//   permissions?: string[]; // Store allowed actions
  resetPasswordToken?:string
  resetPasswordExpires?:Date
//   language?:string
// interests?:any
    socialId?:string
    socialType?:string

    reportNotification?:boolean
inAppVibration?:boolean 
inAppSound?:boolean
latitude?:string
longitude?:string
showNowAvailable?:boolean
pushNotification?:boolean
eventUpdate?:boolean
memories?:boolean
minDistanceKm?:number
maxDistanceKm?:number
ageRangeMin?:number
ageRangeMax?:number
deviceToken?:string
deviceType?:string

  
 

}

class User extends Model<UserAttributes> {
    id!: string; // Use string type for UUID
    FirstName!: string;
    image!: string;
    email!:string;
    // mobilenumber!:string;
    password!:string;
    dob!:Date
    gender!:string
    // role!:string;
    // permissions!: string[]; // Store allowed actions
    resetPasswordToken!:string
    resetPasswordExpires!:Date
    // language!:string
// interests!:any
socialId!:string
socialType!:string
isCompletedProfile!:boolean
reportNotification!:boolean
inAppVibration!:boolean
inAppSound!:boolean
latitude!:string
longitude!:string
showNowAvailable!:boolean
pushNotification!:boolean
eventUpdate!:boolean
memories!:boolean
minDistanceKm!:number
maxDistanceKm!:number
ageRangemax!:number
ageRangeMin!:number
deviceToken!:string
deviceType!:string


   

}

User.init(
  {
   
    id: {
        type: DataTypes.UUID, // Change this to UUID
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
        allowNull: false,
        primaryKey: true,
      },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      FirstName:{
        type:DataTypes.STRING,
        allowNull:true
      },
 
      password:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      email:{
        type:DataTypes.STRING
      },

      resetPasswordExpires:{
        type:DataTypes.DATE,
        allowNull:true

      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  dob:{
    type:DataTypes.DATE,
    allowNull:true


  },
  gender:{
    type:DataTypes.STRING,
    allowNull:true
  },
  // interests:{
  //   type: DataTypes.JSON,// Use JSONB for PostgreSQL or JSON for MySQL
  //   allowNull: true,
  // },
  socialId:{
    type:DataTypes.STRING,
    allowNull:true
  },
  socialType:{    
    type:DataTypes.STRING,
    allowNull:true
  },
  isCompletedProfile:{
    type:DataTypes.BOOLEAN,
    allowNull:true,
    defaultValue:false

},
reportNotification: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
inAppVibration: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
inAppSound: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},


// Location Settings
latitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},
longitude: {
  type: DataTypes.FLOAT,
  allowNull: true,
},
minDistanceKm: {
  type: DataTypes.INTEGER,
  defaultValue: 1,
},
maxDistanceKm: {
  type: DataTypes.INTEGER,
  defaultValue: 20,
},
ageRangeMin: {
  type: DataTypes.INTEGER,
  defaultValue: 18,
},
ageRangeMax: {
  type: DataTypes.INTEGER,
  defaultValue: 38,
},
showNowAvailable: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},

// App-wide Settings
pushNotification: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
eventUpdate: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
memories: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
deviceToken:{
  type:DataTypes.STRING,
  allowNull:true
},
deviceType:{
  type:DataTypes.STRING,
  allowNull:true
}


  },

  {
    sequelize,
    modelName: 'User',
  }
);


export default User;
