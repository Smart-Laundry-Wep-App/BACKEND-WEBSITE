import mysql, { type RowDataPacket } from "mysql2/promise";
import { config } from "./config.js";

export const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  ...(config.DB_SSL_CA ? { ssl: { ca: config.DB_SSL_CA } } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  decimalNumbers: true,
});

export async function rows<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  values: unknown[] = [],
): Promise<T[]> {
  const [result] = await pool.query<T[]>(sql, values);
  return result;
}

export async function audit(
  userId: string,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await pool.execute(
    "INSERT INTO audit_logs (id, user_id, action, entity, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)",
    [crypto.randomUUID(), userId, action, entity, entityId, JSON.stringify(metadata)],
  );
}
