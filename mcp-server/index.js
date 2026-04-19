#!/usr/bin/env node
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const API_BASE_URL = "http://localhost:5000/api";
let jwtToken = null;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (jwtToken) {
    config.headers.Authorization = `Bearer ${jwtToken}`;
  }
  return config;
});

async function authenticate() {
  const email = process.env.FILEDRIVE_EMAIL;
  const password = process.env.FILEDRIVE_PASSWORD;

  if (!email || !password) {
    console.error("Missing FILEDRIVE_EMAIL or FILEDRIVE_PASSWORD in .env");
    process.exit(1);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    jwtToken = response.data.token;
  } catch (error) {
    console.error("Authentication failed:", error.response?.data || error.message);
    process.exit(1);
  }
}

const server = new McpServer({
  name: "filedrive-mcp",
  version: "1.0.0",
});

server.registerTool(
  "list_folders",
  "List folders in FileDrive. Provide parent folder ID to list subfolders.",
  {
    parentId: z.string().optional().describe("ID of the parent folder (optional)"),
  },
  async ({ parentId }) => {
    try {
      const url = parentId ? `/folders?parent=${parentId}` : "/folders";
      const response = await api.get(url);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.response?.data?.message || error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "create_folder",
  "Create a new folder in FileDrive.",
  {
    name: z.string().describe("Name of the new folder"),
    parentId: z.string().optional().describe("ID of the parent folder (optional)"),
  },
  async ({ name, parentId }) => {
    try {
      const response = await api.post("/folders", {
        name,
        parent: parentId || null,
      });
      return {
        content: [{ type: "text", text: `Folder created successfully: ${JSON.stringify(response.data, null, 2)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.response?.data?.message || error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "list_images",
  "List images inside a specific folder.",
  {
    folderId: z.string().describe("ID of the folder"),
  },
  async ({ folderId }) => {
    try {
      const response = await api.get(`/images?folder=${folderId}`);
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.response?.data?.message || error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "upload_image",
  "Upload an image from the local filesystem to a FileDrive folder.",
  {
    name: z.string().describe("Name of the image"),
    folderId: z.string().describe("ID of the folder to upload to"),
    localFilePath: z.string().describe("Absolute local path to the image file to upload"),
  },
  async ({ name, folderId, localFilePath }) => {
    try {
      if (!fs.existsSync(localFilePath)) {
        return {
          content: [{ type: "text", text: `Error: File not found at ${localFilePath}` }],
          isError: true,
        };
      }

      const form = new FormData();
      form.append("name", name);
      form.append("folderId", folderId);
      form.append("image", fs.createReadStream(localFilePath));

      const response = await api.post("/images", form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      return {
        content: [{ type: "text", text: `Image uploaded successfully: ${JSON.stringify(response.data, null, 2)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.response?.data?.message || error.message}` }],
        isError: true,
      };
    }
  }
);

async function startServer() {
  await authenticate();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FileDrive MCP Server running on stdio");
}

startServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
