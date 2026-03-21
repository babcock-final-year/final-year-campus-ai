import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
	setInput,
} from "@formisch/solid";
import { revalidate } from "@solidjs/router";
import { Camera, IdCard, UserRound } from "lucide-solid";
import HomeMainAreaHeader from "~/components/chat/ChatMainAreaHeader";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import UploadImageButton from "~/components/ui/button/UploadImageButton";
import UserProfileImage from "~/components/ui/image/UserProfileImage";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { UserUpdateRequestSchema } from "~/models/users.schemas";
import AuthRpc from "~/rpc/auth";
import UsersRpc from "~/rpc/users";

export default function EditProfileInterfacePage() {
	const userProfile = createUserProfile();

	const editProfileForm = createForm({
		initialInput: {
			avatar_url: userProfile().avatar_url ?? undefined,
			full_name: userProfile().full_name,
			matric_no: userProfile().matric_no ?? undefined,
			username: userProfile().username ?? undefined,
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
			await revalidate(UsersRpc.get.key);
			await revalidate(AuthRpc.me.get.key);
		}
	};

	const onAvatarUpload = (url: string) => {
		setInput(editProfileForm, { input: url, path: ["avatar_url"] });
	};

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
							<BaseButton>Remove</BaseButton>
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

					{/*<Field of={editProfileForm} path={["avatar_url"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<AtSign class="opacity-75" />}
								inputClass="bg-base-200"
								label="Avatar Url"
								type="text"
							/>
						)}
					</Field>*/}
				</div>

				<div class="ml-auto flex gap-4">
					<BaseButton
						class="btn-ghost"
						onClick={() => history.back()}
						type="reset"
					>
						Cancel
					</BaseButton>
					<BaseButton class="btn-primary" type="submit">
						Save Changes
					</BaseButton>
				</div>
			</Form>
		</div>
	);
}
