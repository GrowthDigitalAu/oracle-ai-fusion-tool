import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, User, UserCog } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Organization', icon: <Building2 size={20} />, path: '/organization' },
    { name: 'User', icon: <User size={20} />, path: '/user' },
    { name: 'Roles', icon: <UserCog size={20} />, path: '/roles' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="header-title">MAIN MENU</span>
      </div>
      <nav>
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'menu-item active' : 'menu-item'
                }
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
