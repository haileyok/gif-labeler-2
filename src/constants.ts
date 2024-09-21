import "dotenv/config";

export const DID = process.env.DID ?? "";
export const SIGNING_KEY = process.env.SIGNING_KEY ?? "";
export const PORT = process.env.PORT ?? 4002;
export const JETSTREAM_ENDPOINT= process.env.JETSTREAM_ENDPOINT ?? "";
