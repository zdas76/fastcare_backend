import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PartyService } from "./party.service";

const creadtParty = catchAsync(async (req: Request, res: Response) => {
  const result = await PartyService.createParty(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Party create Successfully",
    data: result,
  });
});

const getAllParty = catchAsync(async (req: Request, res: Response) => {
  const partytype = req.query.partytype as string;

  console.log(partytype);
  const result = await PartyService.getAllParty(partytype);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Party Retrived Successfully",
    data: result,
  });
});

const getPartyById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.query.id);

  const result = await PartyService.getPartyById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "contact Number get Successfully",
    data: result,
  });
});

const updateParty = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await PartyService.updatePartyById(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Party Retrived Successfully",
    data: result,
  });
});

export const partyControllers = {
  creadtParty,
  getPartyById,
  getAllParty,
  updateParty,
};
