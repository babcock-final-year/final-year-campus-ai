import { describe, expect, it } from "vitest";
import {
	LOWER_CASE_REGEX,
	MATRIC_NUMBER_REGEX,
	NUMBER_REGEX,
	SYMBOL_REGEX,
	UPPER_CASE_REGEX,
} from "./regex";

describe("MATRIC_NUMBER_REGEX", () => {
	it("matches valid matric numbers", () => {
		const valids = ["22/0039", "21/4321", "00/0000", "99/9999"];
		for (const v of valids) {
			expect(MATRIC_NUMBER_REGEX.test(v)).toBe(true);
		}
	});

	it("does not match invalid patterns", () => {
		const invalids = [
			"2/0039", // only 1 digit before slash
			"222/0039", // 3 digits before slash
			"22-0039", // wrong separator
			"220039", // missing slash
			"22/039", // only 3 digits after slash
			"ab/cdef", // letters
			"", // empty string
		];

		for (const v of invalids) {
			expect(MATRIC_NUMBER_REGEX.test(v)).toBe(false);
		}
	});
});

describe("UPPER_CASE_REGEX", () => {
	it("matches strings containing at least one uppercase letter (ASCII and Unicode)", () => {
		const valids = ["A", "Hello", "abcD123", "XYZ!", "É", "Δ", "İ"]; // Latin, Latin-ext, Greek, Turkish dotted capital I
		for (const v of valids) {
			expect(UPPER_CASE_REGEX.test(v)).toBe(true);
		}
	});

	it("does not match strings without uppercase letters", () => {
		const invalids = ["hello", "1234", "!@#$", "", "lower_case", "é", "β"];
		for (const v of invalids) {
			expect(UPPER_CASE_REGEX.test(v)).toBe(false);
		}
	});
});

describe("LOWER_CASE_REGEX", () => {
	it("matches strings containing at least one lowercase letter (ASCII and Unicode)", () => {
		const valids = ["a", "hello", "ABCd123", "mixedCASE", "é", "β", "ş"]; // accented and non-Latin lowercase examples
		for (const v of valids) {
			expect(LOWER_CASE_REGEX.test(v)).toBe(true);
		}
	});

	it("does not match strings without lowercase letters", () => {
		const invalids = ["HELLO", "1234", "!@#$", "", "UPPER_CASE", "İ"]; // note: 'İ' is uppercase dotted I
		for (const v of invalids) {
			expect(LOWER_CASE_REGEX.test(v)).toBe(false);
		}
	});
});

describe("NUMBER_REGEX", () => {
	it("matches strings containing at least one digit (ASCII and other digit sets)", () => {
		const valids = [
			"0",
			"123",
			"a1b",
			"99 bottles",
			"١", // Arabic-Indic digit 1
			"४", // Devanagari digit 4
			"٣٠", // Arabic-Indic 30 (two digits)
		];
		for (const v of valids) {
			expect(NUMBER_REGEX.test(v)).toBe(true);
		}
	});

	it("does not match strings without digits", () => {
		const invalids = ["", "abc", "ABC!", "!@#$", "é", "β"];
		for (const v of invalids) {
			expect(NUMBER_REGEX.test(v)).toBe(false);
		}
	});
});

describe("SYMBOL_REGEX", () => {
	it("matches strings containing at least one non-alphanumeric symbol (Unicode-aware)", () => {
		const valids = [
			"!",
			"@",
			"hello!",
			"123#",
			" ",
			"_",
			"😊", // emoji
			"•", // bullet
			"—", // em dash
		];
		for (const v of valids) {
			expect(SYMBOL_REGEX.test(v)).toBe(true);
		}
	});

	it("does not match strings that are purely letters/digits across Unicode", () => {
		const invalids = [
			"",
			"abc",
			"ABC123",
			"0",
			"MixedCase123",
			"é١", // 'é' is a letter, '١' is a digit
			"β५", // Greek small beta + Devanagari digit 5
		];
		for (const v of invalids) {
			expect(SYMBOL_REGEX.test(v)).toBe(false);
		}
	});
});
