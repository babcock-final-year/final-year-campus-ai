import clsx from "clsx/lite";

interface LimitCounterProps {
	val?: number | undefined | null;
	max: number;
	class?: string;
}

export default function LimitCounter(props: LimitCounterProps) {
	const colorClass = () => {
		const ratio = (props.val || 0) / props.max;

		if (ratio > 0.75) return "text-error";
		if (ratio > 0.5) return "text-warning";
		return "text-base-content";
	};

	return (
		<span class={clsx(colorClass(), props.class)}>
			{props.val || 0} / {props.max}
		</span>
	);
}
