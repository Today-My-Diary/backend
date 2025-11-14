export const ffmpegConfig = {
    videoCodec: "libx264",
    preset: "medium",
    crf: 23,
};

export const hlsProfiles = {
    "360p": {
        scale: "scale=-2:360",
        bandwidth: 800000,
        video: {
            bitrate: "400k",
            maxrate: "800k",
            bufsize: "1200k",
            profile: "baseline",
            level: "3.0"
        },
        audio: {
            bitrate: "96k",
            ar: "48000"
        }
    },

    "720p": {
        scale: "scale=-2:720",
        bandwidth: 2500000,
        video: {
            bitrate: "1500k",
            maxrate: "2500k",
            bufsize: "3500k",
            profile: "main",
            level: "3.1"
        },
        audio: {
            bitrate: "128k",
            ar: "48000"
        }
    }, 

    "1080p" : {
        scale: "scale=-2:1080",
        bandwidth: 5000000,
        video: {
            bitrate: "3000k",
            maxrate: "5000k",
            bufsize: "7000k",
            profile: "high",
            level: "4.0"
        },
        audio: {
            bitrate: "192k",
            ar: "48000"
        }
    }
};