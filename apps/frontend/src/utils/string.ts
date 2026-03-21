export function getCapitalizedWordInitials(str: string): string {
	return str.split(" ").reduce((initials, word) => {
		return `${initials}${word[0]?.toUpperCase() ?? ""}`;
	}, "");
}
