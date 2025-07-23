import fetch from "node-fetch";

interface AdminResponse {
  error?: string;
  admin?: any;
}

async function setupSuperAdmin() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as AdminResponse;

    if (!response.ok) {
      throw new Error(data.error || "Failed to create super admin");
    }

    console.log("Super admin created successfully:", data.admin);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

setupSuperAdmin();
