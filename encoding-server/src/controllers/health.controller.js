export class HealthController {
    checkHealth(req, res) {
        res.status(200).json({
            status: "ok",
            service: "encoding-server",
            timestamp: new Date().toISOString(),
        });
    }
}