import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import Link from 'next/link'
import { Box } from '@mui/material';

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {

  const logo = (
    <Box
      component="img"
      src="https://www.camara.leg.br/tema/assets/images/logo-brand-camara-desktop.png"
      sx={{ width: 359, height: 40, cursor: 'pointer', ...sx }}
    />
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link href="/" sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
