// src/models/role.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission {
  module: string;
  actions: string[];
}

export interface IRole extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: IPermission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    module: {
      type: String,
      required: true,
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
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve']
    }]
  }],
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// Indexes
RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema);