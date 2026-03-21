import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH,
	FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH,
	FileComplaintFormSchema,
} from "./file-complaint-form";

describe("FileComplaintFormSchema", () => {
	it("parses valid input", () => {
		const input = {
			description: "Something happened.",
			title: "Noise complaint",
		};
		const output = v.parse(FileComplaintFormSchema, input);
		expect(output).toEqual(input);
	});

	it("throws when title is empty", () => {
		expect(() =>
			v.parse(FileComplaintFormSchema, {
				description: "Something happened.",
				title: "",
			}),
		).toThrow();
	});

	it("throws when description is empty", () => {
		expect(() =>
			v.parse(FileComplaintFormSchema, {
				description: "",
				title: "Noise complaint",
			}),
		).toThrow();
	});

	it("throws when title exceeds max length", () => {
		const tooLongTitle = "a".repeat(FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH + 1);
		expect(() =>
			v.parse(FileComplaintFormSchema, {
				description: "Something happened.",
				title: tooLongTitle,
			}),
		).toThrow();
	});

	it("throws when description exceeds max length", () => {
		const tooLongDescription = "a".repeat(
			FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH + 1,
		);
		expect(() =>
			v.parse(FileComplaintFormSchema, {
				description: tooLongDescription,
				title: "Something happened.",
			}),
		).toThrow();
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(FileComplaintFormSchema, {
			description: "Something happened.",
			title: "Noise complaint",
		});
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output.title).toBe("Noise complaint");

		const bad = v.safeParse(FileComplaintFormSchema, {
			description: "Something happened.",
			title: "",
		});
		expect(bad.success).toBe(false);
	});

	it("works as a runtime guard (v.is)", () => {
		expect(
			v.is(FileComplaintFormSchema, {
				description: "Something happened.",
				title: "Noise complaint",
			}),
		).toBe(true);

		expect(
			v.is(FileComplaintFormSchema, {
				description: "Something happened.",
				title: "a".repeat(FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH + 1),
			}),
		).toBe(false);

		expect(v.is(FileComplaintFormSchema, "not-an-object")).toBe(false);
	});
});
