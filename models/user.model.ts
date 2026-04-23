import mongoose from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional if using OAuth, but required for credentials
    profilePicture?: string;
    settings: {
      learningSteps: number[];
      graduatingMultiplier: number;
      newCardsPerDay: number;
      reviewsPerDay: number;
    };
    level: number;
    experience: number;
    totalStudyTime: number; // Added to interface
    createdAt: Date; // Injected by timestamps
    updatedAt: Date; // Injected by timestamps
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Name is required'],
    trim: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, 'User Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'User Password is required'],
    minLength: 3,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  settings: {
    learningSteps: { 
        type: [Number], 
        default: [5, 20, 25, 60, 1440, 4320]  // Steps in minutes: 5m, 20m, 25m, 60m (1h), 1440m (1d), 4320m (3d)
    },
    graduatingMultiplier: {
        type: Number,
        default: 1
    },
    newCardsPerDay: {
        type: Number,
        default: 20
    },
    reviewsPerDay: { 
      type: Number, 
      default: 999 
    },
  },
  level: {
    type: Number,
    default: 1,
  },
  experience: {
    type: Number,
    default: 0,
  },
  totalStudyTime: { 
  type: Number, 
  default: 0 
},
  
}, { timestamps: true });

// In Next.js, we need to check if the model already exists before creating it
// to avoid compilation errors during development
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);