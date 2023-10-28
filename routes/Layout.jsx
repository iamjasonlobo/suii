import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div>

<div className='header'>
        <div className='logo'>suii</div>
        <nav>
          <ul>
            <li><Link to="/">
              Home
            </Link></li>
            <li>Search</li>
            <li>About</li>
          </ul>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;