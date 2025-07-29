


// Format a datetime string to a readable local format
export function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
}
// Local storage helpers for userId
export function getUserId(): string | null {
    return localStorage.getItem('userId');
}

export function setUserId(id: string) {
    localStorage.setItem('userId', id);
}