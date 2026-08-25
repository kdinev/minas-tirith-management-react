import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  IgrIconButton,
  IgrNavDrawer,
  IgrNavDrawerHeaderItem,
  IgrNavDrawerItem,
  IgrNavbar,
} from "igniteui-react";
import { bandForThreat, threatIndex } from "./data";
import { navGroups } from "./shell/nav";
import { useMediaQuery } from "./shell/use-media-query";
import { Icon } from "./ui/kit";
import { registerCitadelIcons, MT_ICONS } from "./ui/icons";
import styles from "./shell/shell.module.css";

registerCitadelIcons();

/** The day the console reports on. Fixed, because the muster it describes is. */
const RECKONING = "10 March 3019";

export default function App() {
  const { pathname } = useLocation();
  // Below this width the drawer becomes a modal overlay rather than a column.
  const compact = useMediaQuery("(max-width: 1040px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const band = bandForThreat(threatIndex);

  // A new section starts at its own top. Scrolling the DOM is the one thing an
  // effect is for here; the drawer closes from the link that navigated, not from
  // a reaction to the path having changed.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <IgrNavbar>
        {compact ? (
          <IgrIconButton
            slot="start"
            variant="flat"
            name="menu"
            collection={MT_ICONS}
            aria-label={drawerOpen ? "Close the sections menu" : "Open the sections menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          />
        ) : null}

        <span className={styles.brand}>
          <Icon name="tower" />
          <span className={styles.brandText}>
            <span className={styles.brandName}>Minas Tirith</span>
            <span className={styles.brandSub}>Steward&rsquo;s Command</span>
          </span>
        </span>

        <span slot="end" className={styles.navEnd}>
          <span className={styles.reckoning}>
            <span className={styles.reckoningDay}>{RECKONING}</span>
            <span className={styles.reckoningNote}>Steward&rsquo;s Reckoning</span>
          </span>
          {/* The threat readout follows the Steward everywhere. */}
          <Link
            to="/mordor"
            className={styles.threatBadge}
            style={
              {
                "--threat-color": band.color,
                "--threat-ink": band.ink,
              } as React.CSSProperties
            }
          >
            <Icon name={band.icon} />
            <span className={styles.threatText}>
              <span className={styles.threatLabel}>{band.label}</span>
              <span className={styles.threatIndex}>Threat {threatIndex}</span>
            </span>
          </Link>
        </span>
      </IgrNavbar>

      <div className={compact ? `${styles.body} ${styles.bodyCompact}` : styles.body}>
        <IgrNavDrawer
          className={styles.drawer}
          label="Console sections"
          position={compact ? "start" : "relative"}
          open={compact ? drawerOpen : true}
          onClosed={() => setDrawerOpen(false)}
        >
          <nav className={styles.drawerScroll}>
            {navGroups.map(({ group, sections }) => (
              <div key={group}>
                <IgrNavDrawerHeaderItem>{group}</IgrNavDrawerHeaderItem>
                {sections.map((section) => {
                  const active =
                    section.path === "/" ? pathname === "/" : pathname.startsWith(section.path);
                  return (
                    // The anchor carries the navigation semantics — keyboard,
                    // middle-click, focus ring — and the drawer item the look.
                    <Link
                      key={section.path}
                      to={section.path}
                      className={
                        active ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                      }
                      aria-current={active ? "page" : undefined}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <IgrNavDrawerItem active={active}>
                        <Icon name={section.icon} slot="icon" />
                        <span slot="content" className={styles.navItemLabel}>
                          <span className={styles.navItemName}>{section.name}</span>
                          <span className={styles.navItemMeta}>{section.meta}</span>
                        </span>
                      </IgrNavDrawerItem>
                    </Link>
                  );
                })}
              </div>
            ))}
            <p className={styles.drawerFoot}>
              Figures are as returned at the muster of {RECKONING}. Every report carries the day it
              was received; a report three days old is marked as such.
            </p>
          </nav>
        </IgrNavDrawer>

        <main className={styles.main} ref={main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
