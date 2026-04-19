import mongoose from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;            // Optional profile picture URL
    settings: {
        learningSteps: number[];        // Array of intervals in minutes for spaced repetition
        graduatingMultiplier: number;   // Multiplier for interval when a card is graduated
    };
    level: number;                      // User's current level on the plataform
    experience: number;                 // Total experience points earned by the user
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
        // Steps in minutes (default): 5m, 20m, 25m, 60m (1h), 1440m (1d), 4320m (3d)
        default: [5, 20, 25, 60, 1440, 4320] 
    },
    graduatingMultiplier: {
        type: Number,
        // What happens when the user progresses past the last step? (e.g., 3 days * 2 = 6 days)
        default: 2
    }
  },
  level: {
    type: Number,
    default: 1,
  },
  experience: {
    type: Number,
    default: 0,
  },
  
}, { timestamps: true });

// In Next.js, we need to check if the model already exists before creating it
// to avoid compilation errors during development
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);