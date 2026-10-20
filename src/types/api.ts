/** Contratos de respuesta de la API consumidos por el frontend. */

export interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  uptimeSeconds: number;
  database: { up: boolean; transactions: boolean };
  integrations: {
    email: { provider: string; simulated: boolean };
    whatsapp: { provider: string; simulated: boolean };
    documentStorage: { driver: string };
  };
}
