import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { authRouter } from "./modules/auth/auth.route";
import { categoryRouter } from "./modules/category/category.route";
import { gearRouter } from "./modules/gear/gear.route";
import { rentalRouter } from "./modules/rental/rental.route";
import { providerRouter } from "./modules/provider/provider.route";
import { paymentRouter } from "./modules/payment/payment.route";
import { stripeWebhook } from "./modules/payment/payment.controller";
import { reviewRouter } from "./modules/review/review.route";
import { adminRouter } from "./modules/admin/admin.route";


const app: Application = express();

app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  }),
);


// stripe webhook needs raw body, must stay before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res:Response) => {
   res.send("Hello , world!");
});


// ALL Routes
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/gear", gearRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/provider", providerRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);


export default app;