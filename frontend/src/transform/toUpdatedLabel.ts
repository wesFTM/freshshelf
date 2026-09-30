export function toUpdatedLabel(lastUpdated: Date | null, now: Date): string {
    if (!lastUpdated) return "";
    const minutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60_000);
    if (minutes < 1) return "Updated just now";
    if (minutes === 1) return "Updated 1 min ago";
    return `Updated ${minutes} min ago`;
  }