import axios from 'axios';

// 🌐 URL Cloud ของคุณ (แก้ได้ภายหลัง)
const API_URL = 'https://api.kcflow.dev/generate';

interface GenerateRequest {
    spec: any;
    config?: any;
}

interface GenerateResponse {
    // Cloud จะส่งกลับมาเป็น Map: { "client/index.ts": "content...", "router/index.js": "content..." }
    files: Record<string, string>; 
}

export async function sendToCloud(payload: GenerateRequest): Promise<GenerateResponse> {
    try {
        const { data } = await axios.post<GenerateResponse>(API_URL, payload, {
            timeout: 30000, // 30 วินาที
            headers: { 'Content-Type': 'application/json' }
        });
        return data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const msg = error.response?.data?.message || error.message;
            throw new Error(`Cloud Error: ${msg}`);
        }
        throw new Error(`Connection Error: ${error.message}`);
    }
}