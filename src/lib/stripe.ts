let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = import("https://js.stripe.com/v3/").then((module) => {
      const stripe = module.default(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      return stripe;
    });
  }
  return stripePromise;
};
