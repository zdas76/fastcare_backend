import express from "express";
import { partyControllers } from "./party.controller";

const route = express.Router();

route.post("/", partyControllers.creadtParty);

route.get("/", partyControllers.getAllParty);

route.put("/:id", partyControllers.updateParty);

export const PartyRouter = route;
