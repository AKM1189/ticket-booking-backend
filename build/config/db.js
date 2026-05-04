"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = void 0;
const data_source_1 = require("../data-source");
let initialized = false;
const initializeDB = async () => {
    if (!initialized) {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log("✅ Database connected");
        }
        initialized = true;
    }
};
exports.initializeDB = initializeDB;
//# sourceMappingURL=db.js.map