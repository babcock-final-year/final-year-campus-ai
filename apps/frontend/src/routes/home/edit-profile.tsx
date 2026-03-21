import {
	createForm,
	Field,
	Form,
	getInput,
	type SubmitEventHandler,
	setInput,
} from "@formisch/solid";
import { useNavigate } from "@solidjs/router";
import { Camera, IdCard, Image, UserRound } from "lucide-solid";
import { createEffect } from "solid-js";
import HomeMainAreaHeader from "~/components/chat/ChatMainAreaHeader";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import UploadImageButton from "~/components/ui/button/UploadImageButton";
import UserProfileImage from "~/components/ui/image/UserProfileImage";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { UserUpdateRequestSchema } from "~/models/users.schemas";
import { routes } from "~/RouteManifest";
import { revalidateUserData } from "~/rpc/revalidate-query";
import UsersRpc from "~/rpc/users";

export default function EditProfileInterfacePage() {
	const userProfile = createUserProfile();

	const navigate = useNavigate();

	const editProfileForm = createForm({
		initialInput: {
			avatar_url: userProfile().avatar_url,
			full_name: userProfile().full_name,
			matric_no: userProfile().matric_no,
			username: userProfile().username,
		},
		schema: UserUpdateRequestSchema,
	});

	// Show success toast then leave the form
	const onSubmitEditProfileForm: SubmitEventHandler<
		typeof UserUpdateRequestSchema
	> = async (formData, _) => {
		const user = userProfile();

		const res = await UsersRpc.put(user.id, formData);

		if (res.success) {
			await revalidateUserData();
		}

		navigate(routes().home.settings.profile.index);
	};

	const onAvatarUpload = (url: string) => {
		setInput(editProfileForm, { input: url, path: ["avatar_url"] });
		(
			document.querySelector(`input[name='["avatar_url"]']`) as HTMLInputElement
		).value = url;
	};

	// I know this is hacky >~<
	createEffect(() => {
		(
			document.querySelector(`input[name='["avatar_url"]']`) as HTMLInputElement
		).value = userProfile()?.avatar_url || "";
		(
			document.querySelector(`input[name='["full_name"]']`) as HTMLInputElement
		).value = userProfile().full_name;
		(
			document.querySelector(`input[name='["matric_no"]']`) as HTMLInputElement
		).value = userProfile().matric_no;
		(
			document.querySelector(`input[name='["username"]']`) as HTMLInputElement
		).value = userProfile().username;
	});

	return (
		<div class="grid size-full grid-rows-[3.5rem_1fr] bg-base-200">
			<HomeMainAreaHeader />

			<Form
				class="relative flex max-h-9/10 w-9/10 flex-col gap-6 place-self-center overflow-auto rounded-box border border-base-300 bg-base-100 p-6 sm:w-xl"
				of={editProfileForm}
				onSubmit={onSubmitEditProfileForm}
			>
				<div class="flex h-28 justify-center gap-8 sm:h-32 sm:justify-start">
					<UserProfileImage
						class={{
							fallback: "text-3xl",
							wrapper:
								"row-span-3 aspect-square h-24 place-self-center rounded-full shadow-lg outline-3 outline-base-100 sm:h-28",
						}}
						cornerBtn={
							<UploadImageButton
								class="btn-circle btn-sm absolute -right-1 -bottom-1 p-1.5"
								onUpload={onAvatarUpload}
							>
								<Camera />
							</UploadImageButton>
						}
					/>

					<div class="hidden h-full flex-col justify-center gap-2 sm:flex">
						<h2 class="font-semibold text-lg">Profile Photo</h2>
						<p class="text-sm opacity-75">
							Update your profile picture. Max 5MB.
						</p>
						<div class="mt-2 flex gap-4">
							<UploadImageButton onUpload={onAvatarUpload}>
								Change Photo
							</UploadImageButton>
							<BaseButton
								onClick={() => {
									setInput(editProfileForm, {
										input: "",
										path: ["avatar_url"],
									});

									(
										document.querySelector(
											`input[name='["avatar_url"]']`,
										) as HTMLInputElement
									).value = "";
								}}
							>
								Remove
							</BaseButton>
						</div>
					</div>
				</div>

				<div class="divider my-0" />

				<div class="grid grid-cols-1 grid-rows-4 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-8">
					<Field of={editProfileForm} path={["full_name"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<UserRound class="opacity-75" />}
								inputClass="bg-base-200"
								label="Full Name"
								type="text"
							/>
						)}
					</Field>

					<Field of={editProfileForm} path={["username"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<IdCard class="opacity-75" />}
								inputClass="bg-base-200"
								label="Username"
								type="text"
							/>
						)}
					</Field>

					<Field of={editProfileForm} path={["matric_no"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<UserRound class="opacity-75" />}
								inputClass="bg-base-200"
								label="Matric Number"
								type="text"
							/>
						)}
					</Field>

					<Field of={editProfileForm} path={["avatar_url"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<Image class="opacity-75" />}
								inputClass="bg-base-200"
								label="Avatar Url"
								type="url"
							/>
						)}
					</Field>
				</div>

				<div class="ml-auto flex gap-4">
					<BaseButton
						class="btn-ghost"
						disabled={editProfileForm.isSubmitting}
						onClick={() => history.back()}
						type="reset"
					>
						Cancel
					</BaseButton>
					<BaseButton
						class="btn-primary"
						disabled={editProfileForm.isSubmitting}
						type="submit"
					>
						{editProfileForm.isSubmitting ? (
							<div class="loading loading-spinner" />
						) : (
							"Save Changes"
						)}
					</BaseButton>
				</div>
			</Form>
		</div>
	);
}
