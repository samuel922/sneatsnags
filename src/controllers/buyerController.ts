import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { BuyerService } from "../services/buyerService";
import { prisma } from "../utils/prisma";
import { createOfferSchema, updateOfferSchema } from "../utils/validations";
import { logger } from "../utils/logger";

const buyerService = new BuyerService(prisma);

export const createOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = createOfferSchema.parse(req.body);
    const offer = await buyerService.createOffer(req.user!.id, data);
    res.status(201).json(offer);
  } catch (error: any) {
    logger.error("Create offer error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const listOffers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const offers = await buyerService.listOffers(req.user!.id, req.query);
    res.json(offers);
  } catch (error: any) {
    logger.error("List offers error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const offer = await buyerService.getOfferById(req.user!.id, req.params.id);
    res.json(offer);
  } catch (error: any) {
    logger.error("Get offer error:", error);
    res.status(404).json({ error: error.message });
  }
};

export const updateOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = updateOfferSchema.parse(req.body);
    const offer = await buyerService.updateOffer(
      req.user!.id,
      req.params.id,
      data
    );
    res.json(offer);
  } catch (error: any) {
    logger.error("Update offer error:", error);
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const cancelOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const offer = await buyerService.cancelOffer(req.user!.id, req.params.id);
    res.json(offer);
  } catch (error: any) {
    logger.error("Cancel offer error:", error);
    res.status(400).json({ error: error.message });
  }
};
