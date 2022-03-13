"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var UserWordModel = /** @class */ (function (_super) {
    __extends(UserWordModel, _super);
    function UserWordModel() {
        return _super.call(this, UserWordModel) || this;
    }
    UserWordModel.prototype.getMyList = function (page, size) {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model
                            .aggregate()
                            .match({ _openid: this.openid })
                            // .sort({ createTime: -1 }) // serverData 不支持 sort 排序，结果不对
                            .sort({ timestamp: -1 }) // sort 应在 match 操作后，其他操作前
                            .skip((page - 1) * size)
                            .limit(size)
                            .lookup({
                            from: 'word',
                            localField: 'wordId',
                            foreignField: '_id',
                            as: 'words'
                        })
                            .unwind('$words') // 外键关联查询出来的 words 是一个数组，unwind 展开数组
                            .replaceRoot({
                            newRoot: this.command.aggregate.mergeObjects(['$words', { _id: '$$ROOT._id' }]) // NOTE: 使用生词本的 _id 作为返回数据的 _id, 而不是使用 word 的外键 id 值
                        })
                            .end()];
                    case 1:
                        list = (_a.sent()).list;
                        return [2 /*return*/, list];
                }
            });
        });
    };
    UserWordModel.prototype.getMyTotal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.where({ _openid: this.openid }).count()];
                    case 1:
                        total = (_a.sent()).total;
                        return [2 /*return*/, total];
                }
            });
        });
    };
    UserWordModel.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.where({
                            _openid: this.openid
                        }).remove()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserWordModel.$collection = 'userWord';
    return UserWordModel;
}(base_1.default));
exports.default = UserWordModel;
