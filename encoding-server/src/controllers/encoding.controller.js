import path from "path";
import os from "os";
import fs from "fs";

export class EncodingController {
    constructor(encodingBusiness){
        this.encodingBusiness = encodingBusiness;
    }

    async handleEncodingVideo(req, res, next) {
        try{
            const { inputUrl, outputDir, filename } = req.body;
            const userId = req.user?.userId;
            const baseTempDir = path.join(os.tmpdir(), "encoding");
            const userDir = path.join(baseTempDir, userId.toString());
            fs.mkdirSync(userDir, { recursive: true });

            if(!inputUrl || !outputDir || !filename) {
                return res.status(400).json({
                    success: false,
                    message: "파라미터 누락되었습니다.",
                });
            }

            const result = await this.encodingBusiness.handleEncoding({
                inputUrl,
                outputDir: path.join(baseTempDir, userId.toString()),
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