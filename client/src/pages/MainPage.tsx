import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent as createEventApi, fetchEvents as fetchEventsApi, refreshEvents as refreshEventsApi } from '../services/api';
import { formatDateTime, getUserId, setUserId } from '../utils/helpers';

type Event = {
    id: string;
    title: string;
    start: string;
    end: string;
};

const MainPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState<number>(7);

    const userIdFromDB = getUserId();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        if (userId) {
            setUserId(userId);
            navigate('/');
        } else if (!userIdFromDB) {
            navigate('/login');
        }
    }, [navigate, userIdFromDB]);


    const fetchEvents = async () => {
        if (!userIdFromDB) return;
        setLoading(true);
        try {
            const data = await fetchEventsApi(userIdFromDB, range);
            setEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!userIdFromDB) return;
        try {
            await refreshEventsApi(userIdFromDB);
            fetchEvents();
        } catch (err) {
            console.error('Failed to refresh events:', err);
        }
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userIdFromDB) return;

        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload = {
            userId: userIdFromDB,
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
        };

        try {
            await createEventApi(payload);
            fetchEvents();
            form.reset();
        } catch (err) {
            console.error('Failed to create event:', err);
        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userIdFromDB, range]);

    // Group events by week if range is 30, otherwise by day
    const groupedEvents: Record<string, Event[]> = {};
    events.forEach(event => {
        const key = range === 30
            ? `Week ${Math.ceil(new Date(event.start).getDate() / 7)} of ${new Date(event.start).getMonth() + 1}th month`
            : new Date(event.start).toISOString().split('T')[0];
        if (!groupedEvents[key]) groupedEvents[key] = [];
        groupedEvents[key].push(event);
    });

    return (
        <div style={{ padding: 24 }}>
            <h2>Your Events</h2>
            <button onClick={handleRefresh}>Refresh Events</button>
            <div style={{ margin: '10px 0' }}>
                <label>Show events for: </label>
                <select value={range} onChange={e => setRange(Number(e.target.value))}>
                    <option value={1}>Next 1 day</option>
                    <option value={7}>Next 7 days</option>
                    <option value={30}>Next 30 days</option>
                </select>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                Object.entries(groupedEvents).map(([group, groupEvents]) => (
                    <div key={group} style={{ marginBottom: 16 }}>
                        <h4>{group}</h4>
                        <ul>
                            {groupEvents.map(event => (
                                <li key={event.id}>
                                    <strong>{event.title}</strong><br />
                                    {formatDateTime(event.start)} - {formatDateTime(event.end)}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}

            <h3>Create Event</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
                <input name="title" placeholder="Title" required />
                <input name="date" type="date" required />
                <input name="startTime" type="time" required />
                <input name="endTime" type="time" required />
                <button type="submit">Create</button>
            </form>
        </div>
    );
};

export default MainPage;
