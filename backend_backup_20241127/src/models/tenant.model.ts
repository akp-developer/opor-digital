// src/models/tenant.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  code: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: {
    theme: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  modules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { 
    type: String, 
    required: [true, 'Tenant name is required'],
    trim: true
  },
  code: { 
    type: String, 
    required: [true, 'Tenant code is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  domain: { 
    type: String,
    trim: true,
    lowercase: true
  },
  status: { 
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    theme: { type: String, default: 'default' },
    logo: String,
    primaryColor: String,
    secondaryColor: String
  },
  modules: [{
    type: String,
    enum: [
      'one_stop_service',
      'construction_permit',
      'certificate_system',
      'garbage_fee',
      'e_document',
      'news_management',
      'public_docs',
      'user_management',
      'calendar'
    ]
  }]
}, {
  timestamps: true,
  collection: 'tenants'
});

// Indexes
TenantSchema.index({ code: 1 }, { unique: true });
TenantSchema.index({ domain: 1 }, { sparse: true });

export const TenantModel = mongoose.model<ITenant>('Tenant', TenantSchema);