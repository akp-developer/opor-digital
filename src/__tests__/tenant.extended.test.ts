import { Request, Response } from "express";
import { TenantModel } from "../models/tenant.model";
import TenantController from "../modules/tenants/tenant.controller";

describe("Extended Tenant Tests", () => {
  // Test setup code...

  describe("getTenantByCode", () => {
    it("should get tenant by code", async () => {
      const mockTenant = { _id: "1", code: "demo001", status: "active" };
      const req = { params: { code: "demo001" } } as any;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      jest.spyOn(TenantModel, "findOne").mockResolvedValue(mockTenant as any);
      await TenantController.getTenantByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
