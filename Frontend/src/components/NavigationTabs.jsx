import { useState, useRef, useEffect } from "react";

export default function ScrollTabs({ tabs, onTabChange }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabsRef = useRef([]);
  const navRef = useRef(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  useEffect(() => {
    const tabElement = tabsRef.current[activeTab];
    const navElement = navRef.current;

    if (tabElement && navElement) {
      // Update underline
      setUnderlineStyle({
        left: tabElement.offsetLeft,
        width: tabElement.offsetWidth,
      });

      // Scroll tab into center view
      const scrollLeft =
        tabElement.offsetLeft -
        navElement.offsetWidth / 2 +
        tabElement.offsetWidth / 2;

      navElement.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      className="pt-5 border-b-[2px] border-[#E1E1E1]"
      style={{ position: "relative" }}
    >
      <nav
        ref={navRef}
        className="tabs-container"
        style={{
          position: "relative",
          overflowX: "auto",
          whiteSpace: "nowrap",
          msOverflowStyle: "none" /* IE & Edge */,
          scrollbarWidth: "none" /* Firefox */,
        }}
      >
        {tabs?.map((tab) => (
          <button
            key={tab}
            ref={(el) => (tabsRef.current[tab] = el)}
            onClick={() => handleTabClick(tab)}
            className={`tab-button py-2.5 px-2 ${
              activeTab === tab ? "active" : ""
            }`}
            style={{
              display: "inline-block",
              // padding: "0.5rem 1rem",
              fontSize: "1.25rem",
              fontFamily: "Roboto, sans-serif",
              fontWeight: 600,
              textTransform: "capitalize",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "" : "",
              transition: "color 0.3s, border-bottom 0.3s",
            }}
          >
            {tab}
          </button>
        ))}

        {/* Animated underline */}
        <span
          className="underline"
          style={{
            position: "absolute",
            bottom: 0,
            zIndex: "10",
            height: "3px",
            borderRadius: "24px",
            backgroundColor: "#000C63",
            left: underlineStyle.left || 0,
            width: underlineStyle.width || 0,
            transition: "all 0.3s",
          }}
        />
      </nav>
    </div>
  );
}
