"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var success = function (data) {
    return {
        state: 0,
        data: data
    };
};
var fail = function (data) {
    return {
        state: -1,
        data: data
    };
};
var Response = {
    success: success,
    fail: fail
};
exports.default = Response;
