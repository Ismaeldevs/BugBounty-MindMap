import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#0d0d0d',
      backgroundImage: `
        linear-gradient(rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(rgba(74, 14, 78, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74, 14, 78, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      backgroundPosition: '0 0, 0 0, 0 0, 0 0'
    }}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
