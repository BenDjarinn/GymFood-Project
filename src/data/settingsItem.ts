export interface SettingsItem {
  label: string;
  icon: string;
}

const settingsItems: SettingsItem[] = [
  { label: "Account Settings", icon: "settings" },
  { label: "PIN", icon: "pin" },
  { label: "Security & Privacy", icon: "privacy-tip" },
  { label: "FAQ", icon: "help-outline" },
];

export default settingsItems;
