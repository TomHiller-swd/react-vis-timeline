import type { TimelineAnimationOptions } from 'vis-timeline/types';

export type TimelineEventHandler =
	| 'changedHandler'
	| 'clickHandler'
	| 'contextmenuHandler'
	| 'currentTimeTickHandler'
	| 'doubleClickHandler'
	| 'dropHandler'
	| 'groupDraggedHandler'
	| 'itemoutHandler'
	| 'itemoverHandler'
	| 'mouseDownHandler'
	| 'mouseMoveHandler'
	| 'mouseOverHandler'
	| 'mouseUpHandler'
	| 'rangechangeHandler'
	| 'rangechangedHandler'
	| 'selectHandler'
	| 'timechangeHandler'
	| 'timechangedHandler';

export type TimelineEventsHandlers = Partial<Record<TimelineEventHandler, (properties: any) => void>>;

export type CustomTime = {
	datetime: Date;
	id: string;
};

export type SelectionOptions = { focus?: boolean; animation?: TimelineAnimationOptions };
