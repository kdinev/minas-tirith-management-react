/**
 * The console's sections, in the order the Steward reads them.
 *
 * One list drives the drawer, the router and the "what does this cover" copy,
 * so a new section is added in exactly one place.
 */
export interface NavSection {
  path: string;
  /** Label in the drawer. */
  name: string;
  /** One line under the label — what this section answers. */
  meta: string;
  icon: string;
  /** Group heading this section sits under in the drawer. */
  group: string;
}

export const navSections: NavSection[] = [
  {
    path: "/",
    name: "Steward's Table",
    meta: "The whole realm at a glance",
    icon: "tower",
    group: "The Realm",
  },
  {
    path: "/garrisons",
    name: "Garrisons",
    meta: "Strength, morale, health, victual",
    icon: "shield",
    group: "The Realm",
  },
  {
    path: "/command",
    name: "Chain of Command",
    meta: "Captains and what they can muster",
    icon: "command",
    group: "The Realm",
  },
  {
    path: "/provisions",
    name: "Provisions",
    meta: "Victuallers and the granaries",
    icon: "wheat",
    group: "Supply",
  },
  {
    path: "/armoury",
    name: "Armoury",
    meta: "Forges and smithing by location",
    icon: "anvil",
    group: "Supply",
  },
  {
    path: "/allies",
    name: "Allies",
    meta: "Rohan and the sworn fiefs",
    icon: "banner",
    group: "Beyond the Walls",
  },
  {
    path: "/mordor",
    name: "Mordor Watch",
    meta: "Reports on the Enemy, and the threat",
    icon: "eye",
    group: "Beyond the Walls",
  },
];

/** Drawer groups in order, each with its sections. */
export const navGroups: { group: string; sections: NavSection[] }[] = navSections.reduce<
  { group: string; sections: NavSection[] }[]
>((groups, section) => {
  const last = groups.at(-1);
  if (last?.group === section.group) last.sections.push(section);
  else groups.push({ group: section.group, sections: [section] });
  return groups;
}, []);

export function sectionForPath(pathname: string): NavSection {
  // Longest match wins, so "/garrisons" is not shadowed by "/".
  return (
    [...navSections]
      .sort((a, b) => b.path.length - a.path.length)
      .find((s) => (s.path === "/" ? pathname === "/" : pathname.startsWith(s.path))) ??
    navSections[0]
  );
}
