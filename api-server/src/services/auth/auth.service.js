export class AuthService {

    getGoogleLoginUrl() {
        const scopes = process.env.GOOGLE_USERINFO_SCOPES.split(' ');

        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.GOOGLE_REDIRECT_URL,
            response_type: 'code',
            scope: scopes.join(' '),
            prompt: 'consent',
        });
        return `${process.env.GOOGLE_AUTH_URL}?${params.toString()}`;
    }

    async getGoogleTokens(code) {
        const data = {
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code',
        };

        const response = await fetch(process.env.GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching Google tokens:', errorData);
            throw new Error('Failed to get Google tokens');
        }
        return await response.json();
    }

    async getGoogleProfile(accessToken) {
        const response = await fetch(process.env.GOOGLE_USERINFO_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching Google profile:', errorData);
            throw new Error('Failed to get Google profile');
        }
        return await response.json();
    }
}