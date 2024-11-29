import { Request, Response } from "express";
import { TenantModel } from "../models/tenant.model";
import TenantController from "../modules/tenants/tenant.controller";

describe("TenantController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject = {};

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
      }),
    };
  });

  describe("getTenants", () => {
    it("should get all tenants", async () => {
      const mockTenants = [
        { _id: "1", name: "Tenant 1", code: "TN1", status: "active" },
        { _id: "2", name: "Tenant 2", code: "TN2", status: "active" },
      ];

      TenantModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockTenants),
        }),
      });

      await TenantController.getTenants(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        count: 2,
        data: mockTenants,
      });
    });
  });

  // เพิ่ม test cases อื่นๆ ตามเดิม แต่แก้การ mock ให้ตรงกับ Model methods
});
