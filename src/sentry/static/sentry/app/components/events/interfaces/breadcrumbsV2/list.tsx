import React from 'react';
import styled from '@emotion/styled';
import {
  MultiGrid,
  GridCellProps,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';

import space from 'app/styles/space';

import {aroundContentStyle} from './styles';
import ListHeader from './listHeader';
import ListBody from './listBody';
import {BreadcrumbsWithDetails} from './types';

const COLUMN_QUANTITY = 5;

type Props = {
  onSwitchTimeFormat: () => void;
  breadcrumbs: BreadcrumbsWithDetails;
  relativeTime?: string;
} & Omit<React.ComponentProps<typeof ListBody>, 'relativeTime'>;

type State = {
  columnsWidth: Array<number>;
  listBodyHeight?: number;
};

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 100,
});

class List extends React.Component<Props, State> {
  state: State = {
    columnsWidth: [],
  };

  componentDidMount() {
    this.loadState();
  }

  listBodyRef = React.createRef<HTMLDivElement>();
  multiGridRef: MultiGrid | null = null;

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
      columnsWidth.push(firstFiveChildren[index].offsetWidth);
    }

    this.setState({
      listBodyHeight: listBodyElement.offsetHeight,
      columnsWidth,
    });
  }

  renderBody = (columnIndex: number, breadcrumb: BreadcrumbsWithDetails[0]) => {
    const {event, orgId, searchTerm, breadcrumbs} = this.props;
    return (
      <ListBody
        key={`body-column-${breadcrumb.id}-${columnIndex}`}
        orgId={orgId}
        searchTerm={searchTerm}
        breadcrumb={breadcrumb}
        column={columnIndex}
        event={event}
        isLastItem={breadcrumbs[breadcrumbs.length - 1].id === breadcrumb.id}
      />
    );
  };

  renderHeader = (columnIndex: number) => {
    const {displayRelativeTime, onSwitchTimeFormat} = this.props;
    return (
      <ListHeader
        key={`header-column-0-${columnIndex}`}
        column={columnIndex}
        displayRelativeTime={!!displayRelativeTime}
        onSwitchTimeFormat={onSwitchTimeFormat}
      />
    );
  };

  renderCell = ({key, parent, rowIndex, columnIndex, style}: GridCellProps) => (
    <CellMeasurer
      cache={cache}
      columnIndex={columnIndex}
      key={key}
      parent={parent}
      rowIndex={rowIndex}
    >
      <div style={style}>
        {rowIndex === 0
          ? this.renderHeader(columnIndex)
          : this.renderBody(columnIndex, this.props.breadcrumbs[rowIndex - 1])}
      </div>
    </CellMeasurer>
  );

  render() {
    const {breadcrumbs} = this.props;
    const {listBodyHeight, columnsWidth} = this.state;

    if (!listBodyHeight) {
      const crumbColumns = [...Array(COLUMN_QUANTITY).keys()];
      return (
        <Wrapper ref={this.listBodyRef}>
          {crumbColumns.map(this.renderHeader)}
          {breadcrumbs.map(breadcrumb => (
            <React.Fragment key={breadcrumb.id}>
              {crumbColumns.map(column => this.renderBody(column, breadcrumb))}
            </React.Fragment>
          ))}
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <AutoSizer disableHeight>
          {({width}) => (
            <MultiGrid
              ref={el => {
                this.multiGridRef = el;
              }}
              width={width}
              height={listBodyHeight}
              // the columnsWidth is fetched in the first render
              columnWidth={({index}) => columnsWidth[index]}
              rowHeight={cache.rowHeight}
              // +1 is needed for the header
              rowCount={breadcrumbs.length + 1}
              overscanColumnCount={5}
              columnCount={COLUMN_QUANTITY}
              // the fixed row is the header
              fixedRowCount={1}
              cellRenderer={this.renderCell}
            />
          )}
        </AutoSizer>
      </Wrapper>
    );
  }
}

export default List;

const Wrapper = styled('div')`
  max-height: 500px;
  overflow-y: auto;
  display: grid;
  > *:nth-last-child(5):before {
    bottom: calc(100% - ${space(1)});
  }
  grid-template-columns: max-content minmax(132px, 1fr) 6fr max-content max-content;
  ${aroundContentStyle}
`;
