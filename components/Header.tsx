import React from 'react';
import { Logo } from './Logo';

const Header: React.FC = () => {
  return (
    <header style={{
      backgroundColor: '#1a202c',
      padding: '1rem',
      borderBottom: '1px solid #4a5568',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Logo style={{ height: '50px' }} />
      <h1 style={{ color: 'white', marginLeft: '1rem', fontSize: '1.5rem' }}>ScholarAI</h1>
    </header>
  );
};

export default Header;
