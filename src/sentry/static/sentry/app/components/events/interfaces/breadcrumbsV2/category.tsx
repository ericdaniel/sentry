import React from 'react';
import styled from '@emotion/styled';

import Highlight from 'app/components/highlight';
import TextOverflow from 'app/components/textOverflow';
import {defined} from 'app/utils';
import {t} from 'app/locale';

type Props = {
  searchTerm: string;
  category?: string | null;
};

const Category = React.memo(({category, searchTerm}: Props) => {
  const title = !defined(category) ? t('generic') : category;
  return (
    <Wrapper title={title}>
      <TextOverflow>
        <Highlight text={searchTerm}>{title}</Highlight>
      </TextOverflow>
    </Wrapper>
  );
});

export default Category;

const Wrapper = styled('div')`
  color: ${p => p.theme.gray800};
  font-size: ${p => p.theme.fontSizeSmall};
  font-weight: 700;
`;
