import { S3Client } from '@aws-sdk/client-s3';

// Services
import { EncodingService } from './services/encoding/encoding.service.js';
import { S3Service } from './services/s3/s3.service.js';
import { RabbitMQProducerService } from "./services/rabbitmq/rabbitmq.producer.service.js"
import { RabbitMQConsumerService } from "./services/rabbitmq/rabbitmq.consumer.service.js";

// Business
import { EncodingBusiness } from './business/encoding.business.js';


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
});

// 의존성 조립 (Bottom-Up)
const s3Bucket = process.env.S3_BUCKET_NAME;
const awsRegion = process.env.AWS_REGION;
const apiServer = process.env.API_SERVER_URL;

// Services
export const s3Service = new S3Service(s3Client, s3Bucket, awsRegion);
const encodingService = new EncodingService();
export const rabbitMQProducerService = new RabbitMQProducerService();
export const rabbitMQConsumerService = new RabbitMQConsumerService();

// Business
export const encodingBusiness = new EncodingBusiness(encodingService, s3Service, rabbitMQProducerService);