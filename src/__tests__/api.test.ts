// src/tests/api.test.ts
import axios from "axios";

const baseURL = "http://localhost:5000/api";

const testAPI = async () => {
  try {
    // Test register
    const registerResponse = await axios.post(`${baseURL}/auth/register`, {
      username: "testadmin",
      email: "admin@test.com",
      password: "Test12345!",
      firstName: "Test",
      lastName: "Admin",
      role: "admin",
      tenantCode: "demo001",
    });

    console.log("Register Response:", registerResponse.data);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
};

testAPI();
