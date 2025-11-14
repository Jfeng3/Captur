export type PluginConfigType = {
  refresh?: boolean;
  reload?: boolean;
  id?: string;
  onStart?: () => void;
};