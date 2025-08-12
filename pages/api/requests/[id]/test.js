export default function handler(req, res) {
  const { id } = req.query;
  
  res.status(200).json({
    success: true,
    message: "Ruta dinámica de Pages API funcionando correctamente.",
    id: id,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
}
