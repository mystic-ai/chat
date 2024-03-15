import React, { useState, useEffect } from "react";

import { NotificationContainer } from "react-notifications";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

function MasterPage({ children, user, dashboardMode = false }) {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  });

  return (
    <div className="main-body">
      <Header
        currentPath={currentPath}
        dashboardMode={dashboardMode}
        user={user}
      />
      <NotificationContainer />
      {children}


      <Footer displayToggle={false} />
    </div>
  );
}

export default MasterPage;
