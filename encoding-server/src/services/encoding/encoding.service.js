import { spawn } from "child_process";
import { ffmpegConfig } from "./ffmpeg.config.js";
import path from "path";
import os from "os";
import fs from "fs";

export class EncodingService {
    async preparePaths(outputDir, filename) {
        const baseName = path.basename(filename);
        const safeNameRegex = /^[A-Za-z0-9._-]{1,255}$/;

        if(!safeNameRegex.test(baseName)) {
            throw new Error("파일 이름에 허용되지 않는 문자가 있거나 길이가 초과됨");
        }

        const tempInputPath = path.join(outputDir, `temp_${Date.now()}_${baseName}`);
        const outputPath = path.resolve(outputDir, baseName);

        return { tempInputPath, outputPath };
    }

    async prepareWorkspace(userId){
        const baseTempDir = path.join(os.tmpdir(), "encoding");
        const userDir = path.join(baseTempDir, userId.toString());

        await fs.promises.mkdir(userDir, { recursive: true });

        return userDir;
    }

    async transcodeVideo(inputPath, outputDir, filename){
        if(!inputPath || !outputDir || !filename) {
            throw new Error("inputPath, outputDir, filename이 없음");
        }

        const baseName = path.basename(filename);

        const safeNameRegex = /^[A-Za-z0-9._-]{1,255}$/;
        if(!safeNameRegex.test(baseName)) {
            throw new Error("파일 이름에 허용되지 않는 문자가 있거나 길이가 초과됨");
        }

        const outputPath = path.resolve(outputDir, baseName);
        const args = ["-i", inputPath, "-c:v", ffmpegConfig.videoCodec, "-preset", ffmpegConfig.preset, "-crf", String(ffmpegConfig.crf), "-y", outputPath];

        return await new Promise((resolve, reject) => {
            const ff = spawn("ffmpeg", args, {stdio: ["ignore", "pipe", "pipe"]});

            let stderr = "";

            ff.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });

            ff.on("error", (err) =>{
                reject(new Error(`ffmpeg spawn error: ${err.message}`));
            });

            ff.on("close", (code, signal) => {
                if(code===0){
                    resolve(outputPath);
                }
                else{
                    const msg = `ffmpeg exited with code ${code}${signal ? `, signal ${signal}` : ""}. stderr: ${stderr}`;
                    reject(new Error(msg));
                }
            });
        });
    }

    async cleanupWorkspace(outputDir){
        try{
            await fs.rm(outputDir, { recursive: true, force: true });
        }
        catch(err){
            console.log("cleanupWorkspace error: ", err.message);
        }
    }
}