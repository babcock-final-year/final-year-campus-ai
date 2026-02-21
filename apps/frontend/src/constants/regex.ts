// e.g 22/0039, 21/4321
export const MATRIC_NUMBER_REGEX: RegExp = /^\d{2}\/\d{4}$/;

export const UPPER_CASE_REGEX: RegExp = /\p{Lu}/u;

export const LOWER_CASE_REGEX: RegExp = /\p{Ll}/u;

export const NUMBER_REGEX: RegExp = /\p{Nd}/u;

export const SYMBOL_REGEX: RegExp = /[^\p{L}\p{N}]/u;
