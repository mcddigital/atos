import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as storage from "./storage.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cea7216a/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize database endpoint
app.post("/make-server-cea7216a/init", async (c) => {
  try {
    const success = await storage.initializeDatabase();
    if (success) {
      return c.json({ success: true, message: "Database initialized successfully" });
    } else {
      return c.json({ success: false, message: "Could not initialize database automatically. Please create table manually." });
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all atos
app.get("/make-server-cea7216a/atos", async (c) => {
  try {
    const atos = await storage.getByPrefix("ato:");
    
    // Se não houver atos, retorna array vazio
    if (!atos || atos.length === 0) {
      return c.json({ success: true, data: [] });
    }
    
    // Filtra valores nulos e ordena
    const validAtos = atos.filter((ato: any) => ato !== null && ato !== undefined);
    const sortedAtos = validAtos.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return c.json({ success: true, data: sortedAtos });
  } catch (error) {
    console.error("Error fetching atos:", error);
    // Em caso de erro, retorna array vazio para o frontend usar localStorage
    return c.json({ success: true, data: [] });
  }
});

// Get single ato by ID
app.get("/make-server-cea7216a/atos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const ato = await storage.get(`ato:${id}`);
    
    if (!ato) {
      return c.json({ success: false, error: "Ato não encontrado" }, 404);
    }
    
    return c.json({ success: true, data: ato });
  } catch (error) {
    console.error("Error fetching ato:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new ato
app.post("/make-server-cea7216a/atos", async (c) => {
  try {
    const body = await c.req.json();
    const ato = {
      ...body,
      createdAt: body.createdAt || new Date().toISOString()
    };
    
    await storage.set(`ato:${ato.id}`, ato);
    
    return c.json({ success: true, data: ato }, 201);
  } catch (error) {
    console.error("Error creating ato:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ato
app.put("/make-server-cea7216a/atos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existingAto = await storage.get(`ato:${id}`);
    if (!existingAto) {
      return c.json({ success: false, error: "Ato não encontrado" }, 404);
    }
    
    const updatedAto = {
      ...existingAto,
      ...body,
      id, // Garante que o ID não muda
      createdAt: existingAto.createdAt // Mantém data de criação original
    };
    
    await storage.set(`ato:${id}`, updatedAto);
    
    return c.json({ success: true, data: updatedAto });
  } catch (error) {
    console.error("Error updating ato:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete ato
app.delete("/make-server-cea7216a/atos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const existingAto = await storage.get(`ato:${id}`);
    if (!existingAto) {
      return c.json({ success: false, error: "Ato não encontrado" }, 404);
    }
    
    await storage.del(`ato:${id}`);
    
    return c.json({ success: true, message: "Ato deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting ato:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);