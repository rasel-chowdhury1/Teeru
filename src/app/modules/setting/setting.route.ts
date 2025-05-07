import { Router } from "express";
import { settingsController } from "./setting.controller";
import auth from "../../middleware/auth";

export const settingsRoutes = Router();


settingsRoutes
     // Route to get the privacy policy
    .get("/privacy", settingsController.getPrivacyPolicy)
    .get("/termAndConditions", settingsController.getTermConditions)
    .get("/contactUs", settingsController.getAboutUs)
    // Route to create or update the privacy policy
    .put("/", auth("admin"), settingsController.updateSettingsByKey);
