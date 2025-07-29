

import { Request, Response } from 'express';
import { google } from 'googleapis';
import prisma from '../utils/prisma';

export const refreshUserEvents = async (req: Request, res: Response) => {
    const userId = req.query.userId as string;

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const timeMin = new Date(now);
    const timeMax = new Date(now);
    timeMin.setMonth(timeMin.getMonth() - 3);
    timeMax.setMonth(timeMax.getMonth() + 3);

    try {
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        const upserted = await Promise.all(
            events.map(event => {
                if (!event.id || !event.summary || !event.start?.dateTime || !event.end?.dateTime) return null;

                return prisma.event.upsert({
                    where: { googleEventId: event.id },
                    update: {
                        title: event.summary,
                        start: new Date(event.start.dateTime),
                        end: new Date(event.end.dateTime),
                    },
                    create: {
                        googleEventId: event.id,
                        title: event.summary,
                        start: new Date(event.start.dateTime),
                        end: new Date(event.end.dateTime),
                        userId: user.id,
                    },
                });
            })
        );

        res.json({ message: 'Events refreshed', count: upserted.filter(Boolean).length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to refresh events' });
    }
};

export const getUserEvents = async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const rangeParam = parseInt(req.query.range as string) || 7;

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const end = new Date(now);

    if (![1, 7, 30].includes(rangeParam)) {
        return res.status(400).json({ error: 'Invalid range value. Must be 1, 7, or 30.' });
    }

    if (rangeParam === 30) {
        end.setDate(now.getDate() + 30);
    } else {
        end.setDate(now.getDate() + rangeParam);
    }

    try {
        const events = await prisma.event.findMany({
            where: {
                userId: user.id,
                start: {
                    gte: now,
                    lte: end,
                },
            },
            orderBy: {
                start: 'asc',
            },
        });

        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const createUserEvent = async (req: Request, res: Response) => {
    const { userId, title, date, startTime, endTime } = req.body;

    if (!userId || !title || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);

    try {
        const googleEvent = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: title,
                start: { dateTime: start.toISOString(), timeZone: 'UTC' },
                end: { dateTime: end.toISOString(), timeZone: 'UTC' },
            },
        });

        const created = await prisma.event.create({
            data: {
                googleEventId: googleEvent.data.id!,
                title,
                start,
                end,
                userId: user.id,
            },
        });

        res.status(201).json({ event: created });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};