import * as v from "valibot";
import { NonEmptyStringSchema } from "./shared";

export const FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH = 75;
export const FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH = 1000;
export const FILE_COMPLAINT_FORM_MIN_LENGTH = 3;

export const FileComplaintFormSchema = v.object({
	description: v.pipe(
		NonEmptyStringSchema,
		v.minLength(
			FILE_COMPLAINT_FORM_MIN_LENGTH,
			`Description must be at least ${FILE_COMPLAINT_FORM_MIN_LENGTH} characters.`,
		),
		v.maxLength(
			FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH,
			`Description has exceeded the maximum length of ${FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH} characters.`,
		),
	),
	title: v.pipe(
		NonEmptyStringSchema,
		v.minLength(
			FILE_COMPLAINT_FORM_MIN_LENGTH,
			`Title must be at least ${FILE_COMPLAINT_FORM_MIN_LENGTH} characters.`,
		),
		v.maxLength(
			FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH,
			`Title has exceeded the maximum length of ${FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH} characters.`,
		),
	),
});
export type FileComplaintFormInput = v.InferInput<
	typeof FileComplaintFormSchema
>;
export type FileComplaintFormOutput = v.InferOutput<
	typeof FileComplaintFormSchema
>;
