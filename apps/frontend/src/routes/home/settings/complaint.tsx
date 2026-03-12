import {
	createForm,
	Form,
	type SubmitEventHandler,
	SubmitHandler,
} from "@formisch/solid";
import { FileComplaintFormSchema } from "~/models/file-complaint-form";

export default function SettingsInterfaceComplaintPage() {
	const fileComplaintForm = createForm({
		initialInput: { description: "", title: "" },
		schema: FileComplaintFormSchema,
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
		</Form>
	);
}
