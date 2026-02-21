import { describe, expect, it } from "vitest";
import { MATRIC_NUMBER_REGEX } from "./regex";

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
