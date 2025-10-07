import express from "express";
import { PostControllers } from "./post.controllers";

const route = express.Router();

route.post("/", PostControllers.addPost);

route.get("/", PostControllers.getAllPost);

route.get("/:id", PostControllers.getPostByID);

route.put("/:id", PostControllers.updatePostByID);

route.delete("/:id", PostControllers.deletePostByID);

export const PosrRoute = route;
