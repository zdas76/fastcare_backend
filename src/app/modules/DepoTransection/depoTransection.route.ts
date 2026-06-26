import express from "express";
import { DepoTransectionController } from "./depoTransection.controllers";

const route = express.Router();

route.post('/depo-allocation-req', DepoTransectionController.createDepoAllocation)

route.get('/depo-vouchers/:voucherType', DepoTransectionController.getAllDepoAllocation)

route.get('/depo-voucher/:id', DepoTransectionController.getDepoVoucherById)

route.put('/depo-allocation-edit/:id', DepoTransectionController.editDepoAllocation)

route.delete('/:id', DepoTransectionController.deleteDepoAllocation)

route.patch('/depo-allocation-approve/:id', DepoTransectionController.approveDepoAllocation)

route.patch('/depo-allocation-confirm/:id', DepoTransectionController.confirmDepoAllocation)


route.post('/depo-payment-req', DepoTransectionController.createDepoPayment)

route.patch('/depo-payment/:id', DepoTransectionController.updateDepoPayment)

route.post('/depo-receive-req', DepoTransectionController.createDepoReceive)



export const depoTransectionRoutes = route;


