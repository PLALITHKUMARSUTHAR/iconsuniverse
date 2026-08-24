import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingCollectionTray from '../components/collections/FloatingCollectionTray';
import CollectionDrawer from '../components/collections/CollectionDrawer';

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#1a1b20] selection:bg-[#FF5F52] selection:text-white font-sans">
      <Navbar isLanding={true} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingCollectionTray />
      <CollectionDrawer />
    </div>
  );
};

export default LandingLayout;
