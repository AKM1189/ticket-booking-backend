import { Request } from "express";
export const getQueryParams = (
  req: Request,
  defaultPage: number,
  defaultLimit: number,
  defaultSortBy: string,
) => {
  const page = parseInt(req.query.page as string) || defaultPage;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const sortBy = (req.query.sortBy as string) || defaultSortBy;
  const sortOrder = (req.query.sortOrder as string) === "desc" ? "DESC" : "ASC";

  return { page, limit, sortBy, sortOrder };
};
