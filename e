warning: in the working copy of 'prisma/migrations/migration_lock.toml', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex d395027..92ce6d2 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -12,7 +12,7 @@[m
         "@aws-sdk/client-s3": "^3.925.0",[m
         "@aws-sdk/s3-request-presigner": "^3.925.0",[m
         "@ffmpeg-installer/ffmpeg": "^1.1.0",[m
[31m-        "@prisma/client": "^6.18.0",[m
[32m+[m[32m        "@prisma/client": "^6.19.0",[m
         "aws-sdk": "^2.1692.0",[m
         "cookie-parser": "^1.4.7",[m
         "cors": "^2.8.5",[m
[36m@@ -1076,9 +1076,9 @@[m
       ][m
     },[m
     "node_modules/@prisma/client": {[m
[31m-      "version": "6.18.0",[m
[31m-      "resolved": "https://registry.npmjs.org/@prisma/client/-/client-6.18.0.tgz",[m
[31m-      "integrity": "sha512-jnL2I9gDnPnw4A+4h5SuNn8Gc+1mL1Z79U/3I9eE2gbxJG1oSA+62ByPW4xkeDgwE0fqMzzpAZ7IHxYnLZ4iQA==",[m
[32m+[m[32m      "version": "6.19.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@prisma/client/-/client-6.19.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-QXFT+N/bva/QI2qoXmjBzL7D6aliPffIwP+81AdTGq0FXDoLxLkWivGMawG8iM5B9BKfxLIXxfWWAF6wbuJU6g==",[m
       "hasInstallScript": true,[m
       "license": "Apache-2.0",[m
       "engines": {[m
[1mdiff --git a/package.json b/package.json[m
[1mindex 2585453..8019cb6 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -13,7 +13,7 @@[m
     "@aws-sdk/client-s3": "^3.925.0",[m
     "@aws-sdk/s3-request-presigner": "^3.925.0",[m
     "@ffmpeg-installer/ffmpeg": "^1.1.0",[m
[31m-    "@prisma/client": "^6.18.0",[m
[32m+[m[32m    "@prisma/client": "^6.19.0",[m
     "aws-sdk": "^2.1692.0",[m
     "cookie-parser": "^1.4.7",[m
     "cors": "^2.8.5",[m
[1mdiff --git a/prisma/schema.prisma b/prisma/schema.prisma[m
[1mindex 74b1d49..60b9a26 100644[m
[1m--- a/prisma/schema.prisma[m
[1m+++ b/prisma/schema.prisma[m
[36m@@ -38,4 +38,13 @@[m [mmodel Timestamp {[m
   // Timestamp-Video FK[m
   video         Video    @relation(fields: [videoId], references: [videoId])[m
   videoId       BigInt[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mmodel EncodingJob {[m
[32m+[m[32m  jobId   BigInt    @id @default(autoincrement())[m
[32m+[m[32m  userId  BigInt[m
[32m+[m[32m  inputKey String[m
[32m+[m[32m  outputKey String[m
[32m+[m[32m  status String[m
[32m+[m[32m  createdAt DateTime  @default(now())[m
 }[m
\ No newline at end of file[m
[1mdiff --git a/src/app.js b/src/app.js[m
[1mindex a6a5bba..15b04c2 100644[m
[1m--- a/src/app.js[m
[1m+++ b/src/app.js[m
[36m@@ -4,6 +4,7 @@[m [mimport cookieParser from 'cookie-parser';[m
 import cors from 'cors';[m
 [m
 import authRouter from './routes/auth.router.js';[m
[32m+[m[32mimport encodingRouter from './routes/encoding.router.js';[m
 import { errorHandler } from './middlewares/error-handler.middleware.js';[m
 [m
 const app = express();[m
[36m@@ -20,6 +21,7 @@[m [mapp.use(cookieParser());[m
 app.use(cors(corsOptions));[m
 [m
 app.use('/api/auth', authRouter);[m
[32m+[m[32mapp.use('/api/encoding', encodingRouter);[m
 [m
 app.use(errorHandler);[m
 [m
[1mdiff --git a/src/business/encoding.business.js b/src/business/encoding.business.js[m
[1mindex 0034c25..6b35251 100644[m
[1m--- a/src/business/encoding.business.js[m
[1m+++ b/src/business/encoding.business.js[m
[36m@@ -2,9 +2,10 @@[m [mimport path from "path";[m
 import fs from "fs";[m
 [m
 export class EncodingBusiness {[m
[31m-    constructor(encodingService, s3Service) {[m
[32m+[m[32m    constructor(encodingService, s3Service, encodingRepository) {[m
         this.encodingService = encodingService;[m
         this.s3Service = s3Service;[m
[32m+[m[32m        this.encodingRepository = encodingRepository;[m
     }[m
 [m
     async handleEncoding ({inputUrl, outputDir, filename, userId}) {[m
[36m@@ -17,6 +18,15 @@[m [mexport class EncodingBusiness {[m
             const s3Key = `users/${userId}/videos/${Date.now()}_${filename}`; [m
             const s3Result = await this.encodingService.s3Upload(encodingResult,s3Key);[m
             [m
[32m+[m[32m            const inputKey = inputUrl.split(".amazonaws.com/")[1]?.split("?")[0] || "unknwon";[m
[32m+[m
[32m+[m[32m            const job = await this.encodingRepository.createJob({[m
[32m+[m[32m                userId,[m
[32m+[m[32m                inputKey,[m
[32m+[m[32m                outputKey: s3Key,[m
[32m+[m[32m                status: "completed",[m
[32m+[m[32m            });[m
[32m+[m
             if(fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);[m
             if(fs.existsSync(encodingResult)) fs.unlinkSync(encodingResult);[m
 [m
[36m@@ -24,6 +34,7 @@[m [mexport class EncodingBusiness {[m
                 success: true,[m
                 localPath: encodingResult,[m
                 s3Url: s3Result,[m
[32m+[m[32m                dbRecord: job,[m
             };[m
         }catch (error){[m
             console.log(error.message);[m
[1mdiff --git a/src/container.js b/src/container.js[m
[1mindex 74baad7..79bb28a 100644[m
[1m--- a/src/container.js[m
[1m+++ b/src/container.js[m
[36m@@ -2,27 +2,36 @@[m [mimport { prisma } from './db/prisma-client.js';[m
 [m
 // Domain (Repositories)[m
 import { UserRepository } from './domain/repositories/user.repository.js';[m
[32m+[m[32mimport { EncodingRepository } from './domain/repositories/encoding.repository.js';[m
 [m
 // Services[m
 import { AuthService } from './services/auth/auth.service.js';[m
 import { TokenService } from './services/auth/token.service.js';[m
 import { UserService } from './services/user/user.service.js';[m
[32m+[m[32mimport { EncodingService } from './services/encoding/encoding.service.js';[m
[32m+[m[32mimport { ffmpegConfig } from './services/encoding/ffmpeg.config.js';[m
[32m+[m[32mimport { S3Service } from './services/s3/s3.service.js';[m
 [m
 // Business[m
 import { AuthBusiness } from './business/auth.business.js';[m
[32m+[m[32mimport { EncodingBusiness } from './business/encoding.business.js';[m
 [m
 // Controllers[m
 import { AuthController } from './controllers/auth.controller.js';[m
[32m+[m[32mimport { EncodingController } from './controllers/encoding.controller.js';[m
 [m
 // 의존성 조립 (Bottom-Up)[m
 [m
 // Repositories[m
 const userRepository = new UserRepository(prisma);[m
[32m+[m[32mconst encodingRepository = new EncodingRepository(prisma);[m
 [m
 // Services[m
[32m+[m[32mexport const s3Service = new S3Service();[m
 const authService = new AuthService();[m
 export const tokenService = new TokenService();[m
 export const userService = new UserService(userRepository);[m
[32m+[m[32mconst encodingService = new EncodingService(s3Service, ffmpegConfig);[m
 [m
 // Business[m
 const authBusiness = new AuthBusiness([m
[36m@@ -31,5 +40,12 @@[m [mconst authBusiness = new AuthBusiness([m
     tokenService[m
 );[m
 [m
[32m+[m[32mconst encodingBusiness = new EncodingBusiness([m
[32m+[m[32m    encodingService,[m
[32m+[m[32m    s3Service,[m
[32m+[m[32m    encodingRepository[m
[32m+[m[32m);[m
[32m+[m
 // Controllers[m
[31m-export const authController = new AuthController(authBusiness);[m
\ No newline at end of file[m
[32m+[m[32mexport const authController = new AuthController(authBusiness);[m
[32m+[m[32mexport const encodingController = new EncodingController(encodingBusiness);[m
\ No newline at end of file[m
[1mdiff --git a/src/controllers/auth.controller.js b/src/controllers/auth.controller.js[m
[1mindex 4d01ad7..936b9dd 100644[m
[1m--- a/src/controllers/auth.controller.js[m
[1m+++ b/src/controllers/auth.controller.js[m
[36m@@ -40,6 +40,8 @@[m [mexport class AuthController {[m
         }[m
     }[m
 [m
[32m+[m[41m    [m
[32m+[m
     // POST /api/auth/reissue[m
     async reissueAccessToken(req, res, next) {[m
         try {[m
[1mdiff --git a/src/controllers/encoding.controller.js b/src/controllers/encoding.controller.js[m
[1mindex d99f42c..cc18229 100644[m
[1m--- a/src/controllers/encoding.controller.js[m
[1m+++ b/src/controllers/encoding.controller.js[m
[36m@@ -22,7 +22,11 @@[m [mexport class EncodingController {[m
 [m
             res.status(200).json({[m
                 success: true,[m
[31m-                data: result,[m
[32m+[m[32m                data: JSON.parse([m
[32m+[m[32m                    JSON.stringify(result, (_, value) =>[m
[32m+[m[32m                        typeof value === "bigint" ? value.toString() : value[m
[32m+[m[32m                    )[m
[32m+[m[32m                ),[m
             });[m
         }catch(error){[m
             console.log(error);[m
[1mdiff --git a/src/domain/repositories/encoding.repository.js b/src/domain/repositories/encoding.repository.js[m
[1mindex 8bc8f1a..d44a4dc 100644[m
[1m--- a/src/domain/repositories/encoding.repository.js[m
[1m+++ b/src/domain/repositories/encoding.repository.js[m
[36m@@ -1,4 +1,4 @@[m
[31m-export class EncodlingRepository {[m
[32m+[m[32mexport class EncodingRepository {[m
 [m
     constructor(prismaClient) {[m
         this.prisma = prismaClient;[m
[36m@@ -17,14 +17,14 @@[m [mexport class EncodlingRepository {[m
 [m
     async updateJobStatus({ jobId, status }){[m
         return this.prisma.encodingJob.update({[m
[31m-            where: { jobId: jobId },[m
[32m+[m[32m            where: { jobId: BigInt(jobId) },[m
             data: {status},[m
         });[m
     }[m
 [m
     async findJobById({ jobId }) {[m
         return this.prisma.encodingJob.findUnique({[m
[31m-            where: { jobId: BigInd(jobId) },[m
[32m+[m[32m            where: { jobId: BigInt(jobId) },[m
         });[m
     }[m
 }[m
\ No newline at end of file[m
[1mdiff --git a/src/routes/encoding.router.js b/src/routes/encoding.router.js[m
[1mindex e69de29..349bc15 100644[m
[1m--- a/src/routes/encoding.router.js[m
[1m+++ b/src/routes/encoding.router.js[m
[36m@@ -0,0 +1,11 @@[m
[32m+[m[32mimport express from 'express';[m
[32m+[m[32mimport { authMiddleware } from '../middlewares/auth.middleware.js';[m
[32m+[m[32mimport { encodingController } from '../container.js';[m
[32m+[m
[32m+[m
[32m+[m[32mconst router = express.Router();[m
[32m+[m
[32m+[m[32m// POST /api/encoding(PresignedURL, filename, userId to encoding server)[m
[32m+[m[32mrouter.post('/', authMiddleware, encodingController.handleEncodingVideo.bind(encodingController));[m
[32m+[m
[32m+[m[32mexport default router;[m
\ No newline at end of file[m
[1mdiff --git a/src/services/s3/s3.service.js b/src/services/s3/s3.service.js[m
[1mindex cfcf88d..3b7ef2a 100644[m
[1m--- a/src/services/s3/s3.service.js[m
[1m+++ b/src/services/s3/s3.service.js[m
[36m@@ -1,10 +1,7 @@[m
 import {[m
   S3Client,[m
   PutObjectCommand,[m
[31m-  GetObjectCommand,[m
[31m-  DeleteObjectCommand,[m
 } from "@aws-sdk/client-s3";[m
[31m-import AWS from "aws-sdk";[m
 import fs from "fs";[m
 import dotenv from "dotenv"[m
 [m
[36m@@ -19,7 +16,7 @@[m [mexport class S3Service {[m
                 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,[m
             },[m
         });[m
[31m-        this.bucketName = process.env.AWS_S3_BUCKET_NAME;[m
[32m+[m[32m        this.bucketName = process.env.S3_BUCKET_NAME;[m
     }[m
 [m
     async uploadVideo(filePath, key) {[m
