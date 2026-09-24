export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface BaseModalConfig {
  size?: ModalSize;
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export const DEFAULT_MODAL_CONFIG: Required<BaseModalConfig> = {
  size: "md",
  title: "",
  description: "",
  icon: "",
  iconColor: "",
  showHeader: true,
  showFooter: true,
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
};

export const MODAL_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4 sm:mx-0",
};
