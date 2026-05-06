// Vercel Serverless Function Handler
// This wraps your Express server for Vercel's serverless environment

export default async function handler(req, res) {
  // For now, return a simple response
  // In production, this would proxy to your Express backend
  res.status(200).json({ 
    message: "PromptWise API - Running on Vercel",
    status: "ok" 
  });
}
