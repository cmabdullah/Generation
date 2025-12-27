import { useMediaQuery } from './useMediaQuery';

export type Breakpoint = 'mobileSmall' | 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveBreakpointResult {
  isMobileSmall: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

/**
 * Custom hook for determining the current breakpoint based on screen width
 * Provides convenient boolean flags and the current breakpoint name
 *
 * Breakpoints:
 * - mobileSmall: < 375px (iPhone SE, small phones)
 * - mobile: 375px - 767px (standard phones)
 * - tablet: 768px - 1023px (iPads, tablets)
 * - desktop: >= 1024px (laptops, desktops)
 */
export const useResponsiveBreakpoint = (): ResponsiveBreakpointResult => {
  const isMobileSmall = useMediaQuery('(max-width: 375px)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Determine current breakpoint
  const breakpoint: Breakpoint = isMobileSmall ? 'mobileSmall' :
                                isMobile ? 'mobile' :
                                isTablet ? 'tablet' : 'desktop';

  return {
    isMobileSmall,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint
  };
};
