import React from 'react';
import styled from '@emotion/styled';
import {
  List,
  ListRowProps,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import {isEqual} from 'lodash';

import space from 'app/styles/space';

import {aroundContentStyle} from './styles';
import ListHeader from './listHeader';
import ListBody from './listBody';
import {BreadcrumbsWithDetails} from './types';

const LIST_MAX_HEIGHT = 500;

type Props = {
  onSwitchTimeFormat: () => void;
  breadcrumbs: BreadcrumbsWithDetails;
  relativeTime: string;
} & Omit<React.ComponentProps<typeof ListBody>, 'breadcrumb' | 'isLastItem' | 'column'>;

type State = {
  columnsWidth: Array<number>;
  listBodyHeight?: number;
};

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 42,
});

class ListContainer extends React.Component<Props, State> {
  state: State = {
    columnsWidth: [],
  };

  componentDidMount() {
    this.loadState();
  }

  componentWillReceiveProps(prevProps: Props) {
    if (
      !isEqual(prevProps.breadcrumbs, this.props.breadcrumbs) ||
      prevProps.displayRelativeTime !== this.props.displayRelativeTime
    ) {
      this.updateGrid();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!isEqual(prevProps.breadcrumbs, this.props.breadcrumbs)) {
      this.updateGrid();
    }
  }

  listBodyRef = React.createRef<HTMLDivElement>();
  listRef: List | null = null;

  updateGrid() {
    cache.clearAll();
    this.listRef?.forceUpdateGrid();
  }

  loadState() {
    const listBodyElement = this.listBodyRef.current;

    if (!listBodyElement) {
      return;
    }

    const columnsWidth: Array<number> = [];

    const children = listBodyElement.children;

    const firstFiveChildren = [
      children[0],
      children[1],
      children[2],
      children[3],
      children[4],
    ] as Array<HTMLElement>;

    for (let index = 0; index < firstFiveChildren.length; index++) {
      if (index === firstFiveChildren.length - 1) {
        columnsWidth.push(firstFiveChildren[index].offsetWidth + 2);
        continue;
      }
      if (index === firstFiveChildren.length - 2) {
        columnsWidth.push(firstFiveChildren[index].offsetWidth + 1);
        continue;
      }
      columnsWidth.push(firstFiveChildren[index].offsetWidth);
    }

    this.setState({
      listBodyHeight: listBodyElement.offsetHeight,
      columnsWidth,
    });
  }

  renderBody = (breadcrumb: BreadcrumbsWithDetails[0]) => {
    const {
      event,
      orgId,
      searchTerm,
      breadcrumbs,
      relativeTime,
      displayRelativeTime,
    } = this.props;
    return (
      <ListBody
        orgId={orgId}
        searchTerm={searchTerm}
        breadcrumb={breadcrumb}
        event={event}
        relativeTime={relativeTime}
        displayRelativeTime={displayRelativeTime}
        isLastItem={breadcrumbs[breadcrumbs.length - 1].id === breadcrumb.id}
      />
    );
  };

  renderRow = ({index, key, parent, style}: ListRowProps) => {
    const {columnsWidth} = this.state;
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div
          style={{
            ...style,
            display: 'grid',
            gridTemplateColumns: `${columnsWidth[0]}px ${columnsWidth[1]}px ${columnsWidth[2]}px ${columnsWidth[3]}px ${columnsWidth[4]}px`,
          }}
        >
          {this.renderBody(this.props.breadcrumbs[index])}
        </div>
      </CellMeasurer>
    );
  };

  getListHeight() {
    const {listBodyHeight} = this.state;

    if (!listBodyHeight || listBodyHeight > LIST_MAX_HEIGHT) {
      return LIST_MAX_HEIGHT;
    }

    return listBodyHeight;
  }

  render() {
    const {breadcrumbs, displayRelativeTime, onSwitchTimeFormat} = this.props;
    const {listBodyHeight} = this.state;

    if (!listBodyHeight) {
      return (
        <Wrapper ref={this.listBodyRef}>
          <ListHeader
            displayRelativeTime={!!displayRelativeTime}
            onSwitchTimeFormat={onSwitchTimeFormat}
          />
          {breadcrumbs.map(breadcrumb => (
            <React.Fragment key={breadcrumb.id}>
              {this.renderBody(breadcrumb)}
            </React.Fragment>
          ))}
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <ListHeader
          displayRelativeTime={!!displayRelativeTime}
          onSwitchTimeFormat={onSwitchTimeFormat}
        />
        <AutoSizer disableHeight>
          {({width}) => (
            <StyledList
              ref={(el: List | null) => {
                this.listRef = el;
              }}
              deferredMeasurementCache={cache}
              height={this.getListHeight()}
              overscanRowCount={3}
              rowCount={breadcrumbs.length}
              rowHeight={cache.rowHeight}
              rowRenderer={this.renderRow}
              width={width}
            />
          )}
        </AutoSizer>
      </Wrapper>
    );
  }
}

export default ListContainer;

const Wrapper = styled('div')`
  max-height: ${LIST_MAX_HEIGHT}px;
  overflow-y: auto;
  display: grid;
  > *:nth-last-child(5):before {
    bottom: calc(100% - ${space(1)});
  }
  grid-template-columns: max-content minmax(55px, 1fr) 6fr max-content 65px;
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    grid-template-columns: max-content minmax(132px, 1fr) 6fr max-content max-content;
  }

  ${aroundContentStyle}
`;

const StyledList = styled(List)<{height: number}>`
  height: auto !important;
  max-height: ${p => p.height}px;
`;
