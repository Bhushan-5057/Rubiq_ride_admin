import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon, GridIcon, PieChartIcon, PlugInIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import {
  Car,
  ChartNoAxesCombined,
  MoreHorizontal,
  User2,
  User2Icon,
  Users2Icon,
} from "lucide-react";
import axiosInstance from "../store/api/axiosInstance";
import { authStateEventName, clearAuthSession, isAuthenticated } from "../lib/auth";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Home", path: "/", pro: false }],
  },

  {
    icon: <User2 />,
    name: "Admin's",
    subItems: [{ name: "Admin", path: "/admin", pro: false }],
  },
  {
    icon: <Users2Icon />,
    name: "Drivers's",
    subItems: [
      { name: "Driver", path: "/driver", pro: false },
      {
        name: "Documents",
        path: "/documents",
        pro: false,
      },
    ],
  },
  {
    icon: <User2Icon />,
    name: "Passengers",
    path: "/passengers",
  },
  {
    icon: <Car />,
    name: "Ride's",
    path: "/rides",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => isAuthenticated(),
  );

  useEffect(() => {
    const handleAuthStateChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    window.addEventListener("storage", handleAuthStateChange);
    window.addEventListener(authStateEventName, handleAuthStateChange);
    return () => {
      window.removeEventListener("storage", handleAuthStateChange);
      window.removeEventListener(authStateEventName, handleAuthStateChange);
    };
  }, []);

  // Fix: use exact match for "/" to prevent it from matching every path
  const isActive = useCallback(
    (path: string) => {
      if (path === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post("/admin/profile/logout");
    } catch (error: any) {
      console.error("Logout API failed:", error.response?.data || error.message);
    } finally {
      // Always clear auth state regardless of API success/failure.
      clearAuthSession();
      sessionStorage.clear();
      document.cookie =
        "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const buildOthersItems = useCallback((): NavItem[] => {
    if (isLoggedIn) {
      return [
        {
          icon: <PlugInIcon />,
          name: "Sign Out",
          onClick: handleLogout,
        },
      ];
    } else {
      return [
        {
          icon: <PlugInIcon />,
          name: "Authentication",
          subItems: [{ name: "Sign In", path: "/auth" }],
        },
      ];
    }
  }, [isLoggedIn, handleLogout]);

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4 poppins-semibold-italic">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : nav.onClick ? (
            <button
              onClick={nav.onClick}
              className="menu-item group menu-item-inactive cursor-pointer"
            >
              <span className="menu-item-icon-size">{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen border-r border-gray-200 bg-white text-gray-900 
        dark:bg-gray-900 dark:border-gray-800 transition-all duration-300 ease-in-out
        mt-16 lg:mt-0 px-5
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`hidden sm:flex py-6 items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex  w-full transition-all duration-300">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex  gap-2">
              <span className="text-center block text-2xl font-semibold tracking-widest text-gray-900 dark:text-white uppercase select-none">
                <span className="text-gray-700 dark:text-gray-300">RUBIQ</span>
                <span className="ml-2 text-indigo-500 dark:text-indigo-400">
                  RIDE
                </span>
              </span>
            </div>
          ) : (
            <ChartNoAxesCombined
              size={32}
              className="text-indigo-600 dark:text-indigo-400"
            />
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-6"></div>

      {/* Navigation Items */}
      <div
        className={`flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar ${
          isMobileOpen ? "mt-12" : "mt-0 sm:mt-0"
        }`}
      >
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Main Menu */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase tracking-wide text-gray-400 flex ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHorizontal size={18} />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Others Section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase tracking-wide text-gray-400 flex ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <MoreHorizontal size={18} />
                )}
              </h2>
              {renderMenuItems(buildOthersItems(), "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
