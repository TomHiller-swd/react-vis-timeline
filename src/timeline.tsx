import React from 'react';
import { DataSet } from 'vis-data/esnext';
import { Timeline as VisTimelineCtor } from 'vis-timeline/esnext';
import type {
  DateType,
  IdType,
  Timeline as VisTimeline,
  TimelineAnimationOptions,
  TimelineGroup,
  TimelineItem,
  TimelineOptions,
  TimelineEvents,
} from 'vis-timeline/types';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

import _difference from 'lodash/difference';
import _intersection from 'lodash/intersection';
import _each from 'lodash/each';
import _assign from 'lodash/assign';
import _omit from 'lodash/omit';
import _keys from 'lodash/keys';
import type { CustomTime, SelectionOptions, TimelineEventsHandlers } from './models';

const noop = () => {};

const events: TimelineEvents[] = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'drop',
  'mouseOver',
  'mouseDown',
  'mouseUp',
  'mouseMove',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'itemover',
  'itemout',
  'timechange',
  'timechanged',
];

const eventDefaultProps: TimelineEventsHandlers = {};
_each(events, (event) => {
  eventDefaultProps[`${event}Handler`] = noop;
});

type Props = {
  initialItems?: TimelineItem[];
  initialGroups?: TimelineGroup[];
  options?: TimelineOptions;
  selection?: IdType[];
  customTimes?: CustomTime[];
  selectionOptions?: SelectionOptions;
  animate?: boolean | {};
  currentTime?: DateType;
} & TimelineEventsHandlers;

class Timeline extends React.Component<Props, {}> {
  // https://stackoverflow.com/a/57491144
  // eslint-disable-next-line react/static-property-placement
  static defaultProps: Props;

  public timeline: Readonly<VisTimeline>;

  public readonly items: DataSet<TimelineItem>;

  public readonly groups: DataSet<TimelineGroup>;

  ref = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    Object.defineProperty(this, 'items', {
      value: new DataSet<TimelineItem>(),
      writable: false,
    });

    Object.defineProperty(this, 'groups', {
      value: new DataSet<TimelineGroup>(),
      writable: false,
    });
  }

  componentDidMount() {
    const {
      ref,
      props,
      items,
      groups,
    } = this;
    Object.defineProperty(this, 'timeline', {
      value: new VisTimelineCtor(ref.current, items, groups, props.options),
      writable: false,
    });

    events.forEach((event) => {
      const eventHandler = props[`${event}Handler`];
      if (eventHandler !== noop) {
        this.timeline.on(event, eventHandler);
      }
    });

    this.init();
  }

  shouldComponentUpdate(nextProps: Props) {
    const {
      initialItems,
      initialGroups,
      options,
      selection,
      customTimes,
      currentTime,
    } = this.props;

    const itemsChange = initialItems !== nextProps.initialItems;
    const groupsChange = initialGroups !== nextProps.initialGroups;
    const optionsChange = options !== nextProps.options;
    const customTimesChange = customTimes !== nextProps.customTimes;
    const selectionChange = selection !== nextProps.selection;
    const currentTimeChange = currentTime !== nextProps.currentTime;

    if (groupsChange) {
      // eslint-disable-next-line no-console
      console.warn(
        "react-vis-timeline: you are trying to change 'initialGroups' prop. Please use the public api exposed with in ref",
      );
    }

    if (itemsChange) {
      // eslint-disable-next-line no-console
      console.warn(
        "react-vis-timeline: you are trying to change 'initialItems' prop. Please use the public api exposed with in ref",
      );
    }

    if (optionsChange) {
      this.timeline.setOptions(nextProps.options);
    }

    if (customTimesChange) {
      this.updateCustomTimes(customTimes, nextProps.customTimes);
    }

    if (selectionChange) {
      this.updateSelection(nextProps.selection, nextProps.selectionOptions);
    }

    if (currentTimeChange) {
      this.timeline.setCurrentTime(nextProps.currentTime);
    }

    return false;
  }

  componentWillUnmount() {
    this.timeline.destroy();
  }

  updateCustomTimes(prevCustomTimes: CustomTime[], customTimes: CustomTime[]) {
    // diff the custom times to decipher new, removing, updating
    const customTimeKeysPrev = _keys(prevCustomTimes);
    const customTimeKeysNew = _keys(customTimes);
    const customTimeKeysToAdd = _difference(customTimeKeysNew, customTimeKeysPrev);
    const customTimeKeysToRemove = _difference(customTimeKeysPrev, customTimeKeysNew);
    const customTimeKeysToUpdate = _intersection(customTimeKeysPrev, customTimeKeysNew);

    _each(customTimeKeysToRemove, (id) => this.timeline.removeCustomTime(id));
    _each(customTimeKeysToAdd, (id) => {
      const { datetime } = customTimes[id];
      this.timeline.addCustomTime(datetime, id);
    });
    _each(customTimeKeysToUpdate, (id) => {
      const { datetime } = customTimes[id];
      this.timeline.setCustomTime(datetime, id);
    });
  }

  updateSelection(selection: IdType | IdType[], selectionOptions: SelectionOptions): void {
    this.timeline.setSelection(selection, selectionOptions as Required<SelectionOptions>);
  }

  init() {
    const {
      initialItems,
      initialGroups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props;

    let timelineOptions = options;

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = _omit(options, 'start', 'end');

      this.timeline.setWindow(options.start, options.end, {
        animation: animate,
      } as TimelineAnimationOptions);
    }

    this.timeline.setOptions(timelineOptions);

    if (initialGroups?.length > 0) {
      this.groups.add(initialGroups);
    }

    if (initialItems?.length > 0) {
      this.items.add(initialItems);
    }

    this.updateSelection(selection, selectionOptions);

    if (currentTime) {
      this.timeline.setCurrentTime(currentTime);
    }

    this.updateCustomTimes([], customTimes);
  }

  render() {
    return <div ref={this.ref} />;
  }
}

Timeline.defaultProps = _assign(
  {
    initialItems: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: [],
  },
  eventDefaultProps,
);

export default Timeline;
