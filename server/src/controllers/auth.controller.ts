import { Request, Response } from 'express';
import { google } from 'googleapis';
import prisma from '../utils/prisma';

const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export const googleAuth = (req: Request, res: Response) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    });

    res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) return res.status(400).send('No code provided');

    try {
        const { tokens } = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();
        const profile = userInfo.data;

        if (!profile.id || !profile.email) {
            return res.status(400).send('Missing required Google profile information');
        }

        const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: {
                email: profile.email,
                name: profile.name || '',
                accessToken: tokens.access_token || '',
                refreshToken: tokens.refresh_token || '',
            },
            create: {
                googleId: profile.id,
                email: profile.email,
                name: profile.name || '',
                accessToken: tokens.access_token || '',
                refreshToken: tokens.refresh_token || '',
            },
        });

        res.redirect(`http://localhost:5173?userId=${user.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Authentication failed');
    }
};