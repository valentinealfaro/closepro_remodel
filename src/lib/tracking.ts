export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  // GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
  
  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, params);
  }
  
  // Log for dev/debug
  console.log(`[Tracking] ${eventName}`, params);
};
