import express from "express";
import serverHandler from "../../dist/index.js";

const app = express();
export default app;

export { serverHandler as handler };
