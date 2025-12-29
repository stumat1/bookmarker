import { LAYOUT_DENSITIES } from "../contexts/LayoutContext";

export function getLayoutStyles(layoutDensity) {
  const styles = {
    [LAYOUT_DENSITIES.COMPACT]: {
      // Page padding
      pagePadding: "p-3 sm:p-5",
      // Header
      headerMargin: "mb-5",
      logoSize: "w-8 h-8",
      titleSize: "text-3xl sm:text-4xl",
      subtitleSize: "text-base",
      // Form card
      cardPadding: "p-4",
      cardRounded: "rounded-xl",
      cardGap: "gap-4",
      // Input fields
      inputPadding: "px-3 py-2",
      inputRounded: "rounded-lg",
      labelMargin: "mb-1.5",
      labelSize: "text-xs",
      // Buttons
      buttonPadding: "px-3 py-2",
      buttonRounded: "rounded-lg",
      // Bookmark cards
      bookmarkCardPadding: "p-4",
      bookmarkCardRounded: "rounded-xl",
      bookmarkCardGap: "gap-3",
      bookmarkTitleSize: "text-lg",
      bookmarkSpacing: "space-y-3",
      // Tags
      tagPadding: "px-2.5 py-1",
      tagSize: "text-xs",
      tagGap: "gap-1.5",
      // Filters
      filterButtonPadding: "px-4 py-2",
      filterButtonRounded: "rounded-lg",
      // Directory items
      directoryItemPadding: "px-3 py-1.5",
      directoryItemRounded: "rounded-lg",
      // Sticky offset
      stickyTop: "lg:top-5",
    },
    [LAYOUT_DENSITIES.DEFAULT]: {
      // Page padding
      pagePadding: "p-4 sm:p-8",
      // Header
      headerMargin: "mb-8",
      logoSize: "w-12 h-12",
      titleSize: "text-4xl sm:text-5xl",
      subtitleSize: "text-lg",
      // Form card
      cardPadding: "p-6",
      cardRounded: "rounded-2xl",
      cardGap: "gap-6",
      // Input fields
      inputPadding: "px-4 py-3",
      inputRounded: "rounded-lg",
      labelMargin: "mb-2",
      labelSize: "text-sm",
      // Buttons
      buttonPadding: "px-4 py-3",
      buttonRounded: "rounded-lg",
      // Bookmark cards
      bookmarkCardPadding: "p-6",
      bookmarkCardRounded: "rounded-2xl",
      bookmarkCardGap: "gap-4",
      bookmarkTitleSize: "text-xl",
      bookmarkSpacing: "space-y-4",
      // Tags
      tagPadding: "px-3 py-1.5",
      tagSize: "text-xs",
      tagGap: "gap-2",
      // Filters
      filterButtonPadding: "px-5 py-3",
      filterButtonRounded: "rounded-xl",
      // Directory items
      directoryItemPadding: "px-4 py-2",
      directoryItemRounded: "rounded-lg",
      // Sticky offset
      stickyTop: "lg:top-8",
    },
    [LAYOUT_DENSITIES.GENEROUS]: {
      // Page padding
      pagePadding: "p-6 sm:p-12",
      // Header
      headerMargin: "mb-12",
      logoSize: "w-16 h-16",
      titleSize: "text-5xl sm:text-6xl",
      subtitleSize: "text-xl",
      // Form card
      cardPadding: "p-8",
      cardRounded: "rounded-3xl",
      cardGap: "gap-8",
      // Input fields
      inputPadding: "px-5 py-4",
      inputRounded: "rounded-xl",
      labelMargin: "mb-3",
      labelSize: "text-base",
      // Buttons
      buttonPadding: "px-6 py-4",
      buttonRounded: "rounded-xl",
      // Bookmark cards
      bookmarkCardPadding: "p-8",
      bookmarkCardRounded: "rounded-3xl",
      bookmarkCardGap: "gap-5",
      bookmarkTitleSize: "text-2xl",
      bookmarkSpacing: "space-y-6",
      // Tags
      tagPadding: "px-4 py-2",
      tagSize: "text-sm",
      tagGap: "gap-3",
      // Filters
      filterButtonPadding: "px-6 py-4",
      filterButtonRounded: "rounded-xl",
      // Directory items
      directoryItemPadding: "px-5 py-3",
      directoryItemRounded: "rounded-xl",
      // Sticky offset
      stickyTop: "lg:top-12",
    },
  };

  return styles[layoutDensity] || styles[LAYOUT_DENSITIES.DEFAULT];
}
