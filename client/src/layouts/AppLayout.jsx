import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingCollectionTray from '../components/collections/FloatingCollectionTray';
import CollectionDrawer from '../components/collections/CollectionDrawer';

const AppLayout = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isSearchPage = location.pathname === '/search';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${
        isLanding
          ? 'bg-[#faf8ff] text-[#1a1b20] selection:bg-[#FF5F52] selection:text-white'
          : 'bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#4648d4] selection:text-white'
      } ${isSearchPage ? 'h-screen overflow-hidden' : ''}`}
    >
      <Navbar isLanding={isLanding} />
      <main
        className={`flex-1 ${
          isLanding
            ? ''
            : isSearchPage
            ? 'w-full mx-auto max-w-[1440px] px-4 sm:px-8 py-3 overflow-hidden flex flex-col min-h-0'
            : 'w-full mx-auto max-w-[1440px] px-4 sm:px-8 py-8'
        }`}
      >
        <Outlet />
      </main>
      {!isSearchPage && <Footer />}
      <FloatingCollectionTray />
      <CollectionDrawer />
    </div>
  );
};

export default AppLayout;
