import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PostService } from "./post.service";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const addPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.addPostToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post create Successfully",
    data: result,
  });
});

const getAllPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getAllPostToDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post retrived Successfully",
    data: result,
  });
});

const getPostByID = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getAllPostToDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post retrived Successfully",
    data: result,
  });
});

const updatePostByID = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await PostService.updatePostByIdFormDB(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post retrived Successfully",
    data: result,
  });
});

const deletePostByID = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await PostService.updatePostByIdFormDB(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post retrived Successfully",
    data: result,
  });
});

export const PostControllers = {
  addPost,
  getAllPost,
  getPostByID,
  updatePostByID,
  deletePostByID,
};
