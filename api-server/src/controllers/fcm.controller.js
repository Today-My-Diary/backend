export class FcmController {
    constructor(fcmBusiness) {
        this.fcmBusiness = fcmBusiness;
    }

    // [POST] /api/fcm/token
    registerToken = async (req, res, next) => {
        try {
            const { token } = req.body;
            await this.fcmBusiness.registerToken(req.user.userId, token);
            res.status(200).end();
        } catch (error) {
            next(error);
        }
    };
}