// Safe environment variable access without direct process reference
export function getEnv(key: string, defaultValue?: string): string {
    try {
        const value = (globalThis as any).process?.env?.[key];
        return value ?? defaultValue ?? '';
    } catch {
        return defaultValue ?? '';
    }
}

// Exit application safely
export function exitApp(code: number = 1): void {
    try {
        (globalThis as any).process?.exit?.(code);
    } catch {
        // Fallback if process.exit fails
        throw new Error(`Application exit with code ${code}`);
    }
}
