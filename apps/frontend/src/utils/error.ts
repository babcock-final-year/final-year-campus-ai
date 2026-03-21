export function coerceToError(arg: unknown): Error {
	return arg instanceof Error ? arg : Error(String(arg));
}
