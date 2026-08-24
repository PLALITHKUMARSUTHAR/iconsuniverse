import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingCollectionTray from '../components/collections/FloatingCollectionTray';
import CollectionDrawer from '../components/collections/CollectionDrawer';

const SubpageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#4648d4] selection:text-white font-sans">
      <Navbar isLanding={false} />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <FloatingCollectionTray />
      <CollectionDrawer />
    </div>
  );
};

export default SubpageLayout;
