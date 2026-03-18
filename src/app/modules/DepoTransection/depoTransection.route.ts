import express from "express";
import { DepoTransectionController } from "./depoTransection.controllers";

const route = express.Router();

route.post('/depo-allocation-req', DepoTransectionController.createDepoAllocation)

route.get('/depo-allocation-req', DepoTransectionController.getAllDepoAllocation)

route.put('/depo-allocation-edit/:id', DepoTransectionController.editDepoAllocation)

route.patch('/depo-allocation-req/:id', DepoTransectionController.updateDepoAllocation)



export const depoTransectionRoutes = route;


