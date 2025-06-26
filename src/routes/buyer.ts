import { Router } from "express";
import {
  createOffer,
  listOffers,
  getOffer,
  updateOffer,
  cancelOffer,
} from "../controllers/buyerController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.post("/offers", authenticate, authorize("BUYER"), createOffer);
router.get("/offers", authenticate, authorize("BUYER"), listOffers);
router.get("/offers/:id", authenticate, authorize("BUYER"), getOffer);
router.put("/offers/:id", authenticate, authorize("BUYER"), updateOffer);
router.delete("/offers/:id", authenticate, authorize("BUYER"), cancelOffer);

export { router as buyerRoutes };
