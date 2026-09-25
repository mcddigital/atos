import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TABLE_NAME = "kv_store_cea7216a";

// Cria a tabela se não existir
export async function initializeDatabase() {
  const supabase = client();
  
  try {
    // Tenta criar a tabela usando SQL raw
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          key TEXT NOT NULL PRIMARY KEY,
          value JSONB NOT NULL
        );
      `
    });
    
    if (error) {
      console.log("Could not create table via RPC, trying direct query...");
      
      // Tenta criar via query direto
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          key TEXT NOT NULL PRIMARY KEY,
          value JSONB NOT NULL
        );
      `;
      
      // Usa o client do Postgres diretamente
      const dbUrl = Deno.env.get("SUPABASE_DB_URL");
      if (dbUrl) {
        // Importa pg client
        const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
        const pgClient = new Client(dbUrl);
        await pgClient.connect();
        await pgClient.queryObject(createTableSQL);
        await pgClient.end();
        console.log(`Table ${TABLE_NAME} created successfully!`);
        return true;
      }
    } else {
      console.log(`Table ${TABLE_NAME} initialized successfully!`);
      return true;
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
  
  return false;
}

// Verifica se a tabela existe e cria se necessário
async function ensureTable() {
  const supabase = client();
  
  try {
    // Tenta fazer um select simples para ver se a tabela existe
    const { error } = await supabase.from(TABLE_NAME).select("key").limit(1);
    
    if (error && error.message.includes("does not exist")) {
      // Tabela não existe, tenta criar
      console.log(`Table ${TABLE_NAME} does not exist. Attempting to create...`);
      return await initializeDatabase();
    }
    
    return true;
  } catch (error) {
    console.error("Error checking table:", error);
    return false;
  }
}

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from(TABLE_NAME).upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from(TABLE_NAME).select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from(TABLE_NAME).delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const tableExists = await ensureTable();
  
  if (!tableExists) {
    // Se a tabela não existe, retorna array vazio
    return [];
  }
  
  const supabase = client();
  const { data, error } = await supabase.from(TABLE_NAME).select("key, value").like("key", prefix + "%");
  
  if (error) {
    console.error("Error in getByPrefix:", error);
    // Retorna array vazio em vez de lançar erro
    return [];
  }
  
  return data?.map((d) => d.value) ?? [];
};