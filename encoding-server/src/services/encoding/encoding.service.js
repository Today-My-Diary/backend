import { spawn } from "child_process";
import { hlsProfiles } from "./ffmpeg.config.js";
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
        
        const jobId = Date.now().toString();
        const workspace = path.join(baseTempDir, userId.toString(), jobId);

        const dirs = [
            workspace,
            path.join(workspace, "input"),
            path.join(workspace, "logs"),
            ...Object.keys(hlsProfiles).map(r => path.join(workspace, r))
        ];

        for(const dir of dirs){
            await fs.promises.mkdir(dir, { recursive: true });
        }
        return { workspace, jobId };
    }

    getHlsPaths(workspace, filename) {
        const paths = {
            concatList: path.join(workspace, "input", "input.txt"),
            masterPlaylist: path.join(workspace, "master.m3u8"),
            logFile: path.join(workspace, "logs", "ffmpeg.log"),
        };

        for(const res of Object.keys(hlsProfiles)) {
            paths[`out_${res}`] = path.join(workspace, res);
        }
        
        return paths;
    }

    async generateConcatList(paths, parts) {
        const lines = parts
            .sort((a, b) => a.partNumber - b.partNumber)
            .map(p => `file '${p.presignedUrl}'`)
            .join("\n");

        await fs.promises.writeFile(paths.concatList, lines);
        return paths.concatList;
    }

    runFfmpeg(args, logFile){
        return new Promise((resolve, reject) => {
            const ff = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"]});

            let stderr = "";

            ff.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
                fs.appendFileSync(logFile, chunk.toString());
            });

            ff.on("error", (err) => {
                reject(new Error(`ffmpeg spawn error: ${err.message}`));
            });

            ff.on("close", (code) => {
                if (code === 0) {
                    resolve();
                }
                else{
                    reject(new Error(`ffmpeg exited with code ${code}, stderr: ${stderr}`));
                }
            });
        });
    }

    async transcodeMultipartHls(concatListPath, paths){
        const decoderArgs = [
            "-c:v", "libvpx-vp9"
        ];

        for(const res of Object.keys(hlsProfiles)) {
            const profile = hlsProfiles[res];

            const outputDir = paths[`out_${res}`];
            const segmentPath = `${outputDir}/segment_%03d.ts`;
            const playlistPath = `${outputDir}/index.m3u8`;
            
            const args = [
                "-protocol_whitelist", "file, http, https, tcp, tls",
                "-f", "concat",
                "-safe", "0",
                "-i", concatListPath,

                ...decoderArgs,
                 "-c:v", this.ffmpegConfig.videoCodec,
                "-preset", this.ffmpegConfig.preset,
                "-crf", String(this.ffmpegConfig.crf),

                // video settings
                "-vf", profile.scale,
                "-profile:v", profile.video.profile,
                "-level", profile.video.level,
                "-b:v", profile.video.bitrate,
                "-maxrate", profile.video.maxrate,
                "-bufsize", profile.video.bufsize,

                // audio settings
                "-c:a", "aac",
                "-ar", String(profile.audio.ar),
                "-b:a", profile.audio.bitrate,

                // HLS settings
                "-hls_time", "4",
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", segmentPath,

                playlistPath
            ];

            console.log(`[HLS] Encoding ${res}`);
            await this.runFfmpeg(args, paths.logFile);
        }
    }

    async generateMasterPlaylist(paths) {
        const lines = ["#EXTM3U", "#EXT-X-VERSION:3", ""];

        for (const [res, profile] of Object.entries(hlsProfiles)) {
            const height = parseInt(res.replace("p", ""), 10);
            const width =
                height === 360 ? 640 :
                height === 720 ? 1280 :
                height === 1080 ? 1920 : null;

            if(!width) continue;

            lines.push(
                `#EXT-X-STREAM-INF:BANDWIDTH=${profile.bandwidth},RESOLUTION=${width}x${height}`
            );
            lines.push(`${res}/index.m3u8`);
            lines.push("");
        }

        await fs.promises.writeFile(paths.masterPlaylist, lines.join("\n"));
    }

    async cleanupWorkspace(workspace){
        try{
            await fs.rm(workspace, { recursive: true, force: true });
        }
        catch(err){
            console.log("cleanupWorkspace error: ", err.message);
        }
    }
}