import { type I18n } from '@lingui/core';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

type WhatIsTwentyProps = {
  i18n: I18n;
};

export const WhatIsTwenty = ({ i18n }: WhatIsTwentyProps) => {
  return (
    <>
      <SubTitle value={i18n._('What is Tetris Labs?')} />
      <MainText>
        {i18n._(
          'We turn how your team works into AI-powered systems. Tetris Labs builds agentic workflows, AI-powered internal tools, and knowledge systems for high-velocity teams.',
        )}
      </MainText>
    </>
  );
};
