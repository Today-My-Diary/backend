import axios from "axios"; 
export class ApiClient{ 
    constructor(baseUrl){ 
        if(!baseUrl){ 
            throw new Error("Application requires baseUrl"); 
        } 
        this.client = axios.create({ 
            baseURL: baseUrl, 
            timeout: 5000, 
            headers:{ "Content-Type": "application/json" } 
        }); 
    } 

    async notifyEncodingComplete({ userId, videoKey, hlsUrl }){ 
        try{ 
            const response = await this.client.post("/videos/encoding-complete", { userId, videoKey, hlsUrl, }); 
            
            return response.data; 
        } catch(error){ 
            console.error("[apiclient] notifyEncodingComplete error", error.message); 
            throw new Error("Failed to notify API server about encoding completion"); 
        } 
    } 
    
    async requestPresignedUrl(payload){ 
        try{ 
            const response = await this.client.post("/uploads/presigned-url", payload); 
            
            return response.data; 
        } catch(error){ 
            console.error("[apiclient] requestPresignedUrl error", error.message); 
            throw new Error("failed to request presigned url"); 
        } 
    } 
}