/** Distinct non-blank owners from the unfiltered active list, plus the current pick. */
export function toOwnerOptions(
    items: { owner: string }[],
    selected: string,
  ): string[] {
    const names = new Set<string>();
    for (const item of items) {
      const owner = item.owner.trim();
      if (owner) names.add(owner);
    }
    if (selected.trim()) names.add(selected.trim());
    return [...names].sort((a, b) => a.localeCompare(b));
  }