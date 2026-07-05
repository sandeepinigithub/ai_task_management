import { format, parseISO } from 'date-fns';

export class DateUtil {
    /**
     * Formats a date string or Date object into the specified format.
     * @param date - The date string or Date object.
     * @param dateFormat - The format pattern (default: 'dd MMM yyyy').
     * @returns Formatted date string.
     */
    formatDate(date: string | Date, dateFormat: string = 'dd MMM yyyy'): string {
        if (!date) return '';
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, dateFormat);
    }

    /**
     * Formats a date string or Date object into the specified date-time format.
     * @param date - The date string or Date object.
     * @param dateFormat - The format pattern (default: 'dd MMM yyyy HH:mm:ss a').
     * @returns Formatted date-time string.
     */
    formatDateTime(date: string | Date, dateFormat: string = 'dd MMM yyyy HH:mm:ss a'): string {
        if (!date) return '';
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return format(parsedDate, dateFormat);
    }
}
