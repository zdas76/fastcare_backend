import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { JurnalService } from "./journal.service";

const addPurcherReceived = catchAsync(async (req: Request, res: Response) => {
  const result = await JurnalService.createPurchestReceivedIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Purchase Received create successfully",
    data: result,
  });
});

const productTransferInvontory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await JurnalService.addProductTransferIntoDB(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Inventory transfered successfully",
      data: result,
    });
  }
);

const createSalseVoucher = catchAsync(async (req: Request, res: Response) => {
  const result = await JurnalService.createSalesVoucher(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Salse created successfully",
    data: result,
  });
});

const createWholeSalseVoucher = catchAsync(
  async (req: Request, res: Response) => {
    const result = await JurnalService.createHoleSalesVoucher(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Wholesalse created successfully",
      data: result,
    });
  }
);

const createSalseReturnVoucherBySR = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await JurnalService.createSalesReturnVoucherbySR(
      req.body,
      req.user
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Salse return created successfully",
      data: result,
    });
  }
);

const createSalseReturnVoucherByOffice = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await JurnalService.createSalesReturnVoucherByOffice(
      req.body,
      req.user
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Salse return created successfully",
      data: result,
    });
  }
);

const createReceiptVoucher = catchAsync(async (req: Request, res: Response) => {
  const result = await JurnalService.createReceiptVoucher(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Receipt created successfully",
    data: result,
  });
});

const createPaymentdVoucher = catchAsync(
  async (req: Request, res: Response) => {
    const result = await JurnalService.createPaymentVoucher(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  }
);

const createMoneyRecivedVoucher = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await JurnalService.createMoneyReceivedVoucher(
      req.body,
      req.user
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Money Received successfully",
      data: result,
    });
  }
);

const createJournalVoucher = catchAsync(async (req: Request, res: Response) => {
  const result = await JurnalService.createJournalVoucher(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Joournal created successfully",
    data: result,
  });
});

const createFixedJournalVoucher = catchAsync(
  async (req: Request, res: Response) => {
    const result = await JurnalService.createFixedVoucher(req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Fixed created successfully",
      data: result,
    });
  }
);

const createGiftVoucher = catchAsync(async (req: Request, res: Response) => {
  const result = await JurnalService.creategiftedVoucher(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Gift voucher created successfully",
    data: result,
  });
});

export const JournalControllers = {
  addPurcherReceived,
  productTransferInvontory,
  createSalseVoucher,
  createWholeSalseVoucher,
  createSalseReturnVoucherBySR,
  createSalseReturnVoucherByOffice,
  createReceiptVoucher,
  createJournalVoucher,
  createPaymentdVoucher,
  createMoneyRecivedVoucher,
  createFixedJournalVoucher,
  createGiftVoucher,
};
