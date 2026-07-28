import { Request } from 'express';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface IUserTokenPayload {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserTokenPayload;
}

export interface IFingerprintData {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  canvasHash: string;
  webglVendor: string;
  hardwareConcurrency: number;
  fingerprintHash: string;
}

export interface IVerificationPipelineResult {
  success: boolean;
  step: string;
  message: string;
  data?: any;
}
