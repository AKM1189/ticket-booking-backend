"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryParams = void 0;
const getQueryParams = (req, defaultPage, defaultLimit, defaultSortBy, defaultFilterBy = null, defaultSearch = "") => {
    const page = parseInt(req.query.page) || defaultPage;
    const limit = parseInt(req.query.limit) || defaultLimit;
    const sortBy = req.query.sortBy || defaultSortBy;
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";
    const status = req.query.status || defaultFilterBy;
    const search = req.query.search || defaultSearch;
    return { page, limit, sortBy, sortOrder, status, search };
};
exports.getQueryParams = getQueryParams;
//# sourceMappingURL=queryParams.js.map