const API_BASE_URL = 'http://localhost:4000';

export async function fetchEvents(userId: string, range: number = 7) {
    const res = await fetch(`${API_BASE_URL}/events?userId=${userId}&range=${range}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
}

export async function refreshEvents(userId: string) {
    const res = await fetch(`${API_BASE_URL}/events/refresh?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to refresh events');
    return res.json();
}

export async function createEvent(data: {
    userId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
}) {
    const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
}