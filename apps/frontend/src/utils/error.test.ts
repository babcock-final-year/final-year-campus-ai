import { describe, expect, it } from "vitest";
import { coerceToError } from "./error";

describe(coerceToError.name, () => {
	it("should always return an error", () => {
		expect(coerceToError("Foo")).instanceOf(Error);
		expect(coerceToError(Error("Foo"))).instanceOf(Error);
		expect(coerceToError({ Foo: "Foo" })).instanceOf(Error);
		expect(coerceToError(["Foo"])).instanceOf(Error);
		expect(coerceToError(80085)).instanceOf(Error);
	});
});
