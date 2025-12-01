import { StatusCodes } from "http-status-codes";
import { JobPost } from "../../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../shared/prisma";

const addPostToDB = async (payLod: JobPost) => {
  const isExist = await prisma.jobPost.findFirst({
    where: {
      postName: payLod.postName,
    },
  });

  if (isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This name already exists");
  }

  const result = await prisma.jobPost.create({
    data: payLod,
  });

  return result;
};

const getAllPostToDB = async () => {
  const result = await prisma.jobPost.findMany({
    where: {
      isDelete: false,
    },
  });

  return result;
};

const getPostByIdFormDB = async () => {
  const result = await prisma.jobPost.findFirst({
    where: {
      isDelete: false,
    },
  });

  return result;
};

const updatePostByIdFormDB = async (id: number, payLoad: Partial<JobPost>) => {
  const isExist = await prisma.jobPost.findFirst({
    where: { id },
  });

  if (!isExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "This post not found");
  }

  const updateData: Partial<JobPost> = {};
  if (payLoad.depoId !== undefined) updateData.depoId = payLoad.depoId;
  if (payLoad.postName !== undefined) updateData.postName = payLoad.postName;
  if (payLoad.qualification !== undefined)
    updateData.qualification = payLoad.qualification;
  if (payLoad.responsibility !== undefined)
    updateData.responsibility = payLoad.responsibility;

  const result = await prisma.jobPost.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deletePostByIdFormDB = async (id: number, payLoad: Partial<JobPost>) => {
  const result = await prisma.jobPost.update({
    where: { id },
    data: {
      isDelete: true,
    },
  });

  return result;
};

export const PostService = {
  addPostToDB,
  getAllPostToDB,
  getPostByIdFormDB,
  updatePostByIdFormDB,
  deletePostByIdFormDB,
};
