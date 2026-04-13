import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordsList = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  min-width: 0;
`;

export { StyledRecordsList as RecordDetailRecordsListContainer };
