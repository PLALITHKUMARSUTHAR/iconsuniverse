import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingCollectionTray from '../components/collections/FloatingCollectionTray';
import CollectionDrawer from '../components/collections/CollectionDrawer';

const SubpageLayout = () => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  return (
    <div className={`min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#4648d4] selection:text-white font-sans ${isSearchPage ? 'h-screen overflow-hidden' : ''}`}>
      <Navbar isLanding={false} />
      <main className={`flex-1 w-full mx-auto ${isSearchPage ? 'max-w-[1440px] px-4 sm:px-8 py-3 overflow-hidden flex flex-col min-h-0' : 'max-w-[1440px] px-4 sm:px-8 py-8'}`}>
        <Outlet />
      </main>
      {!isSearchPage && <Footer />}
      <FloatingCollectionTray />
      <CollectionDrawer />
    </div>
  );
};

export default SubpageLayout;
