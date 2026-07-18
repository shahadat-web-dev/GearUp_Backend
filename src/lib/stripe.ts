import Stripe from "stripe";
import config from "../config";

// fallback keeps the server booting before real keys are added in .env
const stripe: Stripe = new Stripe(
  config.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

export { stripe };