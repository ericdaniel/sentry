import React from 'react';
import styled from '@emotion/styled';
import {
  MultiGrid,
  GridCellProps,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';

import Tooltip from 'app/components/tooltip';
import space from 'app/styles/space';
import {IconSwitch} from 'app/icons';
import {t} from 'app/locale';

import Time from './time/time';
import Data from './data/data';
import Category from './category';
import Icon from './icon';
import Level from './level';
import {GridCell, GridCellLeft, aroundContentStyle} from './styles';
import ListHeader from './listHeader';
import ListBody from './listBody';
import {BreadcrumbsWithDetails} from './types';

type Props = {
  onSwitchTimeFormat: () => void;
} & Omit<React.ComponentProps<typeof ListBody>, 'relativeTime'>;

type State = {
  columnsWidth: Array<number>;
  listBodyHeight?: number;
};

// const List = React.forwardRef(
//   (
//     {
//       displayRelativeTime,
//       onSwitchTimeFormat,
//       orgId,
//       event,
//       breadcrumbs,
//       searchTerm,
//     }: Props,
//     ref: React.Ref<HTMLDivElement>
//   ) => (
//     <Grid ref={ref}>
//       <ListHeader
//         onSwitchTimeFormat={onSwitchTimeFormat}
//         displayRelativeTime={!!displayRelativeTime}
//       />
//       <ListBody
//         searchTerm={searchTerm}
//         event={event}
//         orgId={orgId}
//         breadcrumbs={breadcrumbs}
//         relativeTime={breadcrumbs[breadcrumbs.length - 1]?.timestamp}
//         displayRelativeTime={!!displayRelativeTime}
//       />
//     </Grid>
//   )
// );

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

  renderColumnContent = (columnIndex: number, breadcrumb: BreadcrumbsWithDetails[0]) => {
    switch (columnIndex) {
      case 0: {
        return (
          <GridCellLeft>
            <Tooltip title={breadcrumb.description}>
              <Icon icon={breadcrumb.icon} color={breadcrumb.color} />
            </Tooltip>
          </GridCellLeft>
        );
      }
      case 1: {
        const {searchTerm} = this.props;
        return (
          <GridCellCategory>
            <Category category={breadcrumb?.category} searchTerm={searchTerm} />
          </GridCellCategory>
        );
      }
      case 2: {
        const {event, orgId, searchTerm} = this.props;
        return (
          <GridCell>
            <Data
              event={event}
              orgId={orgId}
              breadcrumb={breadcrumb}
              searchTerm={searchTerm}
            />
          </GridCell>
        );
      }
      case 3: {
        const {searchTerm} = this.props;
        return (
          <GridCell>
            <Level level={breadcrumb.level} searchTerm={searchTerm} />
          </GridCell>
        );
      }
      case 4: {
        const {displayRelativeTime, breadcrumbs, searchTerm} = this.props;
        return (
          <GridCell>
            <Time
              timestamp={breadcrumb?.timestamp}
              relativeTime={breadcrumbs[breadcrumbs.length - 1]?.timestamp}
              displayRelativeTime={displayRelativeTime}
              searchTerm={searchTerm}
            />
          </GridCell>
        );
      }
      default:
        return null;
    }
  };

  renderColumnHeader = (columnIndex: number) => {
    switch (columnIndex) {
      case 0:
        return <StyledGridCell>{t('Type')}</StyledGridCell>;
      case 1:
        return <CategoryHeader>{t('Category')}</CategoryHeader>;
      case 2:
        return <StyledGridCell>{t('Description')}</StyledGridCell>;
      case 3:
        return <StyledGridCell>{t('Level')}</StyledGridCell>;
      case 4:
        return (
          <TimeHeader>
            <Tooltip title="test">
              <StyledIconSwitch size="xs" />
            </Tooltip>
            <span> {t('Time')}</span>
          </TimeHeader>
        );
      default:
        return null;
    }
  };

  renderCell = ({key, parent, rowIndex, columnIndex, style}: GridCellProps) => {
    const {breadcrumbs} = this.props;
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div style={style}>
          {rowIndex === 0
            ? this.renderColumnHeader(columnIndex)
            : this.renderColumnContent(columnIndex, breadcrumbs[rowIndex])}
        </div>
      </CellMeasurer>
    );
  };
  render() {
    const {
      onSwitchTimeFormat,
      displayRelativeTime,
      searchTerm,
      event,
      orgId,
      breadcrumbs,
    } = this.props;
    const {listBodyHeight, columnsWidth} = this.state;

    if (!listBodyHeight) {
      return (
        <Grid ref={this.listBodyRef}>
          <ListHeader
            onSwitchTimeFormat={onSwitchTimeFormat}
            displayRelativeTime={!!displayRelativeTime}
          />
          <ListBody
            searchTerm={searchTerm}
            event={event}
            orgId={orgId}
            breadcrumbs={breadcrumbs}
            relativeTime={breadcrumbs[breadcrumbs.length - 1]?.timestamp}
            displayRelativeTime={!!displayRelativeTime}
          />
        </Grid>
      );
    }

    return (
      <AutoSizer disableHeight>
        {({width}) => (
          <MultiGrid
            ref={el => {
              this.multiGridRef = el;
            }}
            width={width}
            height={listBodyHeight}
            columnWidth={({index}) => columnsWidth[index]}
            rowHeight={cache.rowHeight}
            rowCount={breadcrumbs.length}
            overscanColumnCount={5}
            columnCount={5}
            fixedRowCount={1}
            cellRenderer={this.renderCell}
          />
        )}
      </AutoSizer>
    );
  }
}

export default List;

const Grid = styled('div')`
  max-height: 500px;
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

const GridCellCategory = styled(GridCell)`
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    padding-left: ${space(1)};
  }
`;

const StyledGridCell = styled(GridCell)`
  position: sticky;
  z-index: ${p => p.theme.zIndex.breadcrumbs.header};
  top: 0;
  border-bottom: 1px solid ${p => p.theme.borderDark};
  background: ${p => p.theme.gray100};
  color: ${p => p.theme.gray600};
  font-weight: 600;
  text-transform: uppercase;
  line-height: 1;
  font-size: ${p => p.theme.fontSizeExtraSmall};

  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    padding: ${space(2)} ${space(2)};
    font-size: ${p => p.theme.fontSizeSmall};
  }
`;

const CategoryHeader = styled(StyledGridCell)`
  @media (min-width: ${p => p.theme.breakpoints[0]}) {
    padding-left: ${space(1)};
  }
`;

const TimeHeader = styled(StyledGridCell)`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: ${space(1)};
  cursor: pointer;
`;

const StyledIconSwitch = styled(IconSwitch)`
  transition: 0.15s color;
  &:hover {
    color: ${p => p.theme.gray500};
  }
`;
