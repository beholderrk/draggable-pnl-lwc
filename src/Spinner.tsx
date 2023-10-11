import * as React from 'react';
import clsx from 'clsx';

import './spinner.css';

export interface SpinnerProps {
	className?: string;
}

export function Spinner(props: SpinnerProps): JSX.Element {
	const className = clsx(
		props.className,
		'tv-spinner',
		'tv-spinner--shown',
	);

	return (
		<div className={ className } role="progressbar"></div>
	);
}
