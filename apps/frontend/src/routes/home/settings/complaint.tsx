import {
	createForm,
	Field,
	Form,
	getInput,
	reset,
	type SubmitEventHandler,
	SubmitHandler,
} from "@formisch/solid";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import LimitCounter from "~/components/ui/indicator/LimitCounter";
import { useToastContext } from "~/context/ToastContextProvider";
import {
	FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH,
	FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH,
	FileComplaintFormSchema,
} from "~/models/file-complaint-form";
import ComplaintRpc from "~/rpc/complaint";
import { coerceToError } from "~/utils/error";

export default function SettingsInterfaceComplaintPage() {
	const fileComplaintForm = createForm({
		initialInput: { description: "", title: "" },
		schema: FileComplaintFormSchema,
		validate: "input",
	});

	// TODO: add a place where users can view their complaints.
	const toast = useToastContext();

	let form!: HTMLFormElement;

	const handleSubmitFileComplaintForm: SubmitEventHandler<
		typeof FileComplaintFormSchema
	> = async (formData, _) => {
		try {
			const res = await ComplaintRpc.post({
				description: formData.description,
				title: formData.title,
			});

			if (res.success) {
				// Reset the form on success.
				reset(fileComplaintForm);
				form.reset();

				toast.showToast({
					description:
						"Thank you. We've received your report and will review it shortly.",
					title: "Complaint submitted",
					type: "success",
				});
			} else {
				console.error("Failed to submit complaint:", res.err);

				toast.showToast({
					description: res.err.message ?? "Unknown error",
					title: "Failed to submit complaint",
					type: "error",
				});
			}
		} catch (err) {
			console.error("Error submitting complaint:", err);

			toast.showToast({
				description: coerceToError(err).message ?? "Unknown error",
				title: "Error submitting complaint",
				type: "error",
			});
		}
	};

	return (
		<Form
			class="flex size-full flex-col rounded-box border border-base-300 bg-secondary p-4"
			of={fileComplaintForm}
			onSubmit={handleSubmitFileComplaintForm}
			ref={form}
		>
			<h2 class="font-semibold">File Complaint</h2>
			<div class="divider my-2" />

			<div class="flex grow flex-col gap-6 p-2">
				<Field of={fileComplaintForm} path={["title"]}>
					{(field) => (
						<FieldTextInput
							{...field}
							icon=""
							inputClass="bg-base-200 max-w-full w-full"
							label={
								<h4 class="flex">
									Complaint Title
									<LimitCounter
										class="ml-auto"
										max={FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH}
										val={
											getInput(fileComplaintForm, { path: ["title"] })?.length
										}
									/>
								</h4>
							}
							placeholder="Brief summary of the issue"
							type="text"
						/>
					)}
				</Field>

				<Field of={fileComplaintForm} path={["description"]}>
					{(field) => (
						<FieldTextInput
							{...field}
							icon=""
							inputClass="bg-base-200 max-w-full w-full h-32 resize-none"
							label={
								<h4 class="flex">
									Detailed Description
									<LimitCounter
										class="ml-auto"
										max={FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH}
										val={
											getInput(fileComplaintForm, { path: ["description"] })
												?.length
										}
									/>
								</h4>
							}
							placeholder="Please provide as much detail as possible..."
							type="textarea"
						/>
					)}
				</Field>

				<div class="flex gap-4">
					<BaseButton
						class="btn-primary"
						disabled={fileComplaintForm.isSubmitting}
						type="submit"
					>
						{fileComplaintForm.isSubmitting ? (
							<div class="loading loading-spinner" />
						) : (
							"Send Report"
						)}
					</BaseButton>
					<BaseButton
						class="btn-ghost"
						disabled={fileComplaintForm.isSubmitting}
						onClick={() => reset(fileComplaintForm)}
						type="reset"
					>
						Cancel
					</BaseButton>
				</div>
			</div>
		</Form>
	);
}
