import React from 'react';
import { useContext, useEffect } from 'react';
import { MyContext } from "../../App";
const NotFound = () => {

  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHideComponents(true);
    window.scrollTo(0, 0);
  }, [context]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFound;