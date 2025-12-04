import { throwError } from "../errors/throwError.js";

export class FcmController {
    constructor(fcmBusiness) {
        this.fcmBusiness = fcmBusiness;
    }

    registerToken = async (req, res) => {
        if (!req.body || !req.body.fcmToken) {
            throwError("fcmToken is required", 400, "FCM_TOKEN_REQUIRED");
        }
        const { fcmToken } = req.body;
        await this.fcmBusiness.registerToken(req.user.userId, fcmToken);
        res.status(200).end();
    };
}
