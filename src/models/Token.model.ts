import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface IToken {
  emailVerificationExpiresToken?: string;
  emailVerificationToken?: string;
  resetPasswordExpires?: string;
  resetPasswordToken?: string;
  userId: Schema.Types.ObjectId;
  accessToken?: string;
  refreshToken?: string;
}

export interface ITokenDocument extends Document, IToken {
  generatePasswordReset(): Promise<void>;
  generateEmailVerificationToken(): Promise<void>;
  generateToken(): Promise<string>;
}

export const TokenSchema: Schema<ITokenDocument> = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    emailVerificationToken: {
      type: String,
      required: false,
    },
    emailVerificationExpiresToken: {
      type: Date,
      required: false,
    },
    accessToken: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
  },

  { timestamps: true }
);

// Generate Password Reset
TokenSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // expires in an hour
};

// Generate email verification token
TokenSchema.methods.generateEmailVerificationToken = function () {
  this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationExpiresToken = Date.now() + 3600000; // expires in an hour
};

// Generate Refresh/Access Token
TokenSchema.methods.generateToken = function (
  payload: { userId: Schema.Types.ObjectId },
  secret: string,
  signOptions: any
): Promise<string> {
  return new Promise(function (resolve, reject) {
    jwt.sign(payload, secret, signOptions, (err: Error | null, encoded: string | undefined) => {
      if (err === null && encoded !== undefined) {
        resolve(encoded);
      } else {
        reject(err);
      }
    });
  });
};

TokenSchema.post('save', function () {
  console.log('Token is been Save ', this);
});

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
