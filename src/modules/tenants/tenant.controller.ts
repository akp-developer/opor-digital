// src/modules/tenants/tenant.controller.ts

import { Request, Response } from "express";
import { TenantModel } from "../../models/tenant.model";
import { UserModel } from "../../models/user.model";

class TenantController {
  // เพิ่ม method initializeSystem
  public async initializeSystem(req: Request, res: Response) {
    try {
      // เช็คว่ามี tenant อยู่แล้วหรือไม่
      const existingTenant = await TenantModel.findOne();
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: "System already initialized"
        });
      }

      // สร้าง default tenant
      const tenant = await TenantModel.create({
        name: "Default Tenant",
        code: "demo001",
        modules: ["user_management", "calendar"],
        status: "active"
      });

      // สร้าง admin user
      const admin = await UserModel.create({
        username: "admin",
        email: "admin@test.com",
        password: "Test12345!",
        firstName: "System",
        lastName: "Admin",
        role: "admin",
        tenantId: tenant._id,
        status: "active"
      });

      res.status(201).json({
        success: true,
        message: "System initialized successfully",
        data: {
          tenant: {
            id: tenant._id,
            code: tenant.code
          },
          admin: {
            email: admin.email,
            role: admin.role
          }
        }
      });
    } catch (error: any) {
      console.error("Initialize system error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error initializing system"
      });
    }
  }
  public async getTenants(req: Request, res: Response) {
    try {
      const tenants = await TenantModel.find();
      res.status(200).json({
        success: true,
        count: tenants.length,
        data: tenants,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching tenants" });
    }
  }

  public async getTenant(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findById(req.params.id);
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, data: tenant });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching tenant" });
    }
  }

  public async getTenantByCode(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findOne({ code: req.params.code });
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, data: tenant });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching tenant" });
    }
  }

  public async searchTenants(req: Request, res: Response) {
    try {
      const { name } = req.query;
      const query = name ? { name: { $regex: name, $options: "i" } } : {};
      const tenants = await TenantModel.find(query);
      res.status(200).json({
        success: true,
        count: tenants.length,
        data: tenants,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error searching tenants" });
    }
  }

  public async createTenant(req: Request, res: Response) {
    try {
      console.log("Create tenant request:", req.body);
      const tenant = await TenantModel.create(req.body);
      res.status(201).json({ success: true, data: tenant });
    } catch (error: any) {
      console.error("Create tenant error:", error);
      if (error.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "Tenant code already exists" });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async updateTenant(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, data: tenant });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error updating tenant" });
    }
  }

  public async deleteTenant(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findByIdAndDelete(req.params.id);
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error deleting tenant" });
    }
  }

  public async updateStatus(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, data: tenant });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error updating status" });
    }
  }

  public async updateModules(req: Request, res: Response) {
    try {
      const tenant = await TenantModel.findByIdAndUpdate(
        req.params.id,
        { modules: req.body.modules },
        { new: true }
      );
      if (!tenant) {
        res.status(404).json({ success: false, message: "ไม่พบ tenant" });
        return;
      }
      res.status(200).json({ success: true, data: tenant });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error updating modules" });
    }
  }
}

export default new TenantController();
