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
import {
	FILE_COMPLAINT_FORM_DESCRIPTION_MAX_LENGTH,
	FILE_COMPLAINT_FORM_TITLE_MAX_LENGTH,
	FileComplaintFormSchema,
} from "~/models/file-complaint-form";

export default function SettingsInterfaceComplaintPage() {
	const fileComplaintForm = createForm({
		initialInput: { description: "", title: "" },
		schema: FileComplaintFormSchema,
		validate: "input",
	});

	const handleSubmitFileComplaintForm: SubmitEventHandler<
		typeof FileComplaintFormSchema
	> = (formData, e) => {
		// TODO: Sumbit file complaint
	};

	return (
		<Form
			class="flex size-full flex-col rounded-box border border-base-300 bg-secondary p-4"
			of={fileComplaintForm}
			onSubmit={handleSubmitFileComplaintForm}
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
					<BaseButton class="btn-primary" type="submit">
						Send Report
					</BaseButton>
					<BaseButton
						class="btn-ghost"
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
