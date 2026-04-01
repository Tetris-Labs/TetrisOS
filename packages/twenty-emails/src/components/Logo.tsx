import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="https://www.tetrislabs.co/favicon.ico"
      alt="Tetris Labs logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
