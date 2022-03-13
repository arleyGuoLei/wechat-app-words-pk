"use strict";
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
var user_1 = require("./../model/user");
var book_1 = require("./../model/book");
var userWord_1 = require("./../model/userWord");
var constants_1 = require("../utils/constants");
var UserController = (0, base_1.default)({
    login: function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, self, book;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = new user_1.default();
                        return [4 /*yield*/, user.getSelf()];
                    case 1:
                        self = _a.sent();
                        if (!!self) return [3 /*break*/, 4];
                        return [4 /*yield*/, user.register()
                            // NOTE: 新用户注册后，默认选择的单词书选择人数 + 1
                        ];
                    case 2:
                        _a.sent();
                        book = new book_1.default();
                        void book.changeSelectBook(constants_1.DEFAULT_USER_SELECT_BOOK_ID);
                        return [4 /*yield*/, user.getSelf()];
                    case 3:
                        self = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!self) {
                            return [2 /*return*/, this.fail('获取用户信息失败，请稍后重试 ~')];
                        }
                        return [2 /*return*/, this.success(self)];
                }
            });
        });
    },
    changeSelectBook: function (_a) {
        var newSelectBookId = _a.newSelectBookId, oldSelectBookId = _a.oldSelectBookId;
        return __awaiter(this, void 0, void 0, function () {
            var book, hasBook, user, changed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!newSelectBookId) {
                            return [2 /*return*/, this.fail('获取新的单词书 id 失败')];
                        }
                        book = new book_1.default();
                        return [4 /*yield*/, book.exist(newSelectBookId)]; // 判断单词书是否存在
                    case 1:
                        hasBook = _b.sent() // 判断单词书是否存在
                        ;
                        if (!hasBook) {
                            return [2 /*return*/, this.fail('获取单词书信息失败')];
                        }
                        user = new user_1.default();
                        return [4 /*yield*/, user.changeSelectBook(newSelectBookId)];
                    case 2:
                        changed = _b.sent();
                        if (!changed) return [3 /*break*/, 4];
                        return [4 /*yield*/, book.changeSelectBook(newSelectBookId, oldSelectBookId)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, this.success('更新单词书成功')];
                    case 4: return [2 /*return*/, this.fail('更新单词书失败，请重试')];
                }
            });
        });
    },
    getReviewList: function (_a) {
        var page = _a.page;
        return __awaiter(this, void 0, void 0, function () {
            var pageSize, userWord, _b, list, total, totalPage, nextPage, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pageSize = 20;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        userWord = new userWord_1.default();
                        return [4 /*yield*/, Promise.all([userWord.getMyList(page, pageSize), userWord.getMyTotal()])];
                    case 2:
                        _b = _c.sent(), list = _b[0], total = _b[1];
                        totalPage = Math.ceil(total / pageSize);
                        nextPage = page + 1;
                        return [2 /*return*/, this.success({
                                list: list,
                                nextPage: nextPage <= totalPage ? nextPage : null
                            })];
                    case 3:
                        error_1 = _c.sent();
                        console.log('生词本获取失败');
                        console.log(error_1);
                        return [2 /*return*/, this.fail('生词本获取失败，请稍后重试')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    getRanking: function (_a) {
        var type = _a.type;
        return __awaiter(this, void 0, void 0, function () {
            var user, data, data, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        user = new user_1.default();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        if (!(type === 'experience')) return [3 /*break*/, 3];
                        return [4 /*yield*/, user.getExperienceRanking()];
                    case 2:
                        data = _b.sent();
                        return [2 /*return*/, this.success(data)];
                    case 3:
                        if (!(type === 'learning')) return [3 /*break*/, 5];
                        return [4 /*yield*/, user.getLearningRanking()];
                    case 4:
                        data = _b.sent();
                        return [2 /*return*/, this.success(data)];
                    case 5: throw new Error('未设置排名类型');
                    case 6:
                        error_2 = _b.sent();
                        console.log('获取排行榜失败 ↓');
                        console.log(error_2);
                        return [2 /*return*/, this.fail('获取排行榜失败, 请稍后重试')];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    clearUserWords: function () {
        return __awaiter(this, void 0, void 0, function () {
            var userWord, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userWord = new userWord_1.default();
                        return [4 /*yield*/, userWord.deleteAll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.success(true)];
                    case 2:
                        error_3 = _a.sent();
                        console.log('生词清空失败');
                        return [2 /*return*/, this.fail('生词清空失败，请稍后重试')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
});
exports.default = UserController;
