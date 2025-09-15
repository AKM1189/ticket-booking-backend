import { Request } from "express";
export const getQueryParams = (
  req: Request,
  defaultPage: number,
  defaultLimit: number,
  defaultSortBy: string,
  defaultFilterBy: string | null = null,
  defaultSearch: string | null = "",
) => {
  const page = parseInt(req.query.page as string) || defaultPage;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const sortBy = (req.query.sortBy as string) || defaultSortBy;
  const sortOrder = (req.query.sortOrder as string) === "desc" ? "DESC" : "ASC";
  const status = (req.query.status as string) || defaultFilterBy;
  const search = (req.query.search as string) || defaultSearch;

  return { page, limit, sortBy, sortOrder, status, search };
};
