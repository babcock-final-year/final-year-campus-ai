import { describe, expect, it } from "vitest";
import { getCapitalizedWordInitials } from "./string";

describe(getCapitalizedWordInitials.name, () => {
	it("should correctly extract the intials of a sentence and capitalize them", () => {
		expect(getCapitalizedWordInitials("Jordan Greeman")).toBe("JG");
		expect(getCapitalizedWordInitials("Jones G. Dick")).toBe("JGD");
		expect(getCapitalizedWordInitials("Bob")).toBe("B");
		expect(getCapitalizedWordInitials("Bob Bones")).toBe("BB");
	});
});
