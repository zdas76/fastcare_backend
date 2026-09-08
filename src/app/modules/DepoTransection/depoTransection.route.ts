import express from "express";
import { DepoTransectionController } from "./depoTransection.controllers";

const route = express.Router();

route.post('/depo-allocation-req', DepoTransectionController.createDepoAllocation)

route.put('/depo-allocation-edit/:id', DepoTransectionController.editDepoAllocation)

route.patch('/depo-allocation-approve/:id', DepoTransectionController.approveDepoAllocation)

route.patch('/depo-allocation-confirm/:id', DepoTransectionController.confirmDepoAllocation)


route.get('/depo-vouchers/:voucherType', DepoTransectionController.getAllDepoAllocation)

route.get('/depo-voucher/:id', DepoTransectionController.getDepoVoucherById)

route.delete('/:id', DepoTransectionController.deleteDepoAllocation)


route.post('/depo-payment-req', DepoTransectionController.createDepoPayment)

route.patch('/depo-payment/:id', DepoTransectionController.updateDepoPayment)

route.patch('/depo-payment-confirm/:id', DepoTransectionController.confirmDepoPayment)


route.post('/depo-receive-req', DepoTransectionController.createDepoReceive)


export const depoTransectionRoutes = route;


