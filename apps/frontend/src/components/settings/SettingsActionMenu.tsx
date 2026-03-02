import clsx from "clsx/lite";

/** Will be to the side on desktop, and a horizontal scollable list on mobile */
export default function SettingsActionMenu(props: { class?: string }) {
	return <div class={clsx(props.class)}></div>;
}
