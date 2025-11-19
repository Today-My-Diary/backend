export class EncodingController {
    constructor(encodingBusiness){
        this.encodingBusiness = encodingBusiness;
    }

    async handleEncodingVideo(req, res, next) {
        try{
            const { uploadId, key, filename } = req.body;
            const userId = req.auth.userId;
            console.log("req.auth: ", req.auth);

            if(!uploadId || !key || !filename) {
                return res.status(400).json({
                    success: false,
                    message: "파라미터 누락되었습니다.",
                });
            }

            if (!filename.endsWith(".webm")) {
                return res.status(400).json({
                    success: false,
                    message: ".webm 영상만 지원합니다",
                });
            }

            const result = await this.encodingBusiness.handleEncoding({
                uploadId,
                key,
                filename,
                userId,
            });

            res.status(200).json({
                success: true,
                data: JSON.parse(
                    JSON.stringify(result, (_, value) =>
                        typeof value === "bigint" ? value.toString() : value
                    )
                ),
            });
        }catch(error){
            console.log(error);
            throw error;
        }
    }
}