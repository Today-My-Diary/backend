//FFmpeg 로직 + 인코딩 실행

import { exec } from "child_process";
import { promisify } from "util";
import { ffmpegConfig } from "./ffmpeg.config.js";

const execAsync = promisify(exec);

export class EncodingService {
    async transcodeVideo(inputPath, outputPath){
        const command = `ffmpeg -i "${inputPath}" -c:v ${ffmpegConfig.videoCodec} -preset ${ffmpegConfig.preset} -crf${ffmpegConfig.crf} -y "$${outputPath}"`
        console.log(command);
        await execAsync(command);
        console.log(outputPath);
        return outputPath;
    }
}