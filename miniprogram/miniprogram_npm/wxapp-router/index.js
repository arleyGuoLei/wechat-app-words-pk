module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1647761481029, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib/router"), exports);
__exportStar(require("./lib/navigator"), exports);
__exportStar(require("./lib/logger"), exports);
__exportStar(require("./lib/land-transfer"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0NBQTZCO0FBQzdCLGtEQUFnQztBQUNoQywrQ0FBNkI7QUFDN0Isc0RBQW9DIn0=
}, function(modId) {var map = {"./lib/router":1647761481030,"./lib/navigator":1647761481032,"./lib/logger":1647761481031,"./lib/land-transfer":1647761481036}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481030, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
var logger_1 = __importDefault(require("./logger"));
var navigator_1 = __importDefault(require("./navigator"));
var route_1 = __importDefault(require("./route"));
var route_matcher_1 = __importDefault(require("./route-matcher"));
var utils_1 = require("./utils");
var Router = /** @class */ (function () {
    function Router() {
        this.routes = {};
        this.routeMatchers = [];
    }
    Router.prototype.register = function (option) {
        var tiers = option.route
            .replace(/^\//, '')
            .replace(/$\//, '')
            .split('/')
            .slice(0, -1)
            .join('.');
        utils_1.setter(this.routes, tiers, new route_1.default({ routeUrl: option.route }));
        if (option.path)
            this.routeMatchers.push(new route_matcher_1.default(option.path, option.route));
    };
    Router.prototype.batchRegister = function (options) {
        var _this = this;
        options.forEach(function (option) { return _this.register(option); });
    };
    Router.prototype.getRoutes = function () {
        return this.routes;
    };
    Router.prototype.matchRoute = function (pathOrRoute) {
        var _a, _b;
        var matchResult = this.routeMatchers
            .map(function (routeMatcher) { return routeMatcher.match(pathOrRoute); })
            .filter(function (result) { return !!result; });
        logger_1.default.debug('route match result:', { matchResult: matchResult, pathOrRoute: pathOrRoute });
        return {
            path: ((_a = matchResult[0]) === null || _a === void 0 ? void 0 : _a.route) || pathOrRoute,
            params: ((_b = matchResult[0]) === null || _b === void 0 ? void 0 : _b.params) || {},
        };
    };
    Router.prototype.gotoPage = function (pathOrRoute, query) {
        var _a = this.matchRoute(pathOrRoute), path = _a.path, params = _a.params;
        return navigator_1.default.gotoPage(path, Object.assign({}, params, query));
    };
    Router.prototype.navigateTo = function (pathOrRoute, query) {
        var _a = this.matchRoute(pathOrRoute), path = _a.path, params = _a.params;
        return navigator_1.default.navigateTo(path, Object.assign({}, params, query));
    };
    Router.prototype.switchTab = function (pathOrRoute, query) {
        var _a = this.matchRoute(pathOrRoute), path = _a.path, params = _a.params;
        return navigator_1.default.switchTab(path, Object.assign({}, params, query));
    };
    Router.prototype.redirectTo = function (pathOrRoute, query) {
        var _a = this.matchRoute(pathOrRoute), path = _a.path, params = _a.params;
        return navigator_1.default.redirectTo(path, Object.assign({}, params, query));
    };
    Router.prototype.navigateBack = function (query, option) {
        return navigator_1.default.navigateBack(query, option);
    };
    return Router;
}());
exports.Router = Router;
exports.default = Router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0RBQThCO0FBQzlCLDBEQUFzRDtBQUN0RCxrREFBNEI7QUFDNUIsa0VBQTJDO0FBQzNDLGlDQUFpQztBQU9qQztJQUFBO1FBQ1UsV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLGtCQUFhLEdBQXdCLEVBQUUsQ0FBQztJQThFbEQsQ0FBQztJQTVFUSx5QkFBUSxHQUFmLFVBQTJCLE1BQXNCO1FBQy9DLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLO2FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2FBQ2xCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2FBQ2xCLEtBQUssQ0FBQyxHQUFHLENBQUM7YUFDVixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWIsY0FBTSxDQUNKLElBQUksQ0FBQyxNQUFNLEVBQ1gsS0FBSyxFQUNMLElBQUksZUFBSyxDQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUNqRCxDQUFDO1FBQ0YsSUFBSSxNQUFNLENBQUMsSUFBSTtZQUNiLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTSw4QkFBYSxHQUFwQixVQUFxQixPQUFPO1FBQTVCLGlCQUVDO1FBREMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0sMEJBQVMsR0FB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
}, function(modId) { var map = {"./logger":1647761481031,"./navigator":1647761481032,"./route":1647761481034,"./route-matcher":1647761481035,"./utils":1647761481033}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481031, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var mini_logger_1 = require("@jerryc/mini-logger");
var logger = new mini_logger_1.Logger({ prefix: 'wxapp-router' });
exports.default = logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBNkM7QUFFN0MsSUFBTSxNQUFNLEdBQVEsSUFBSSxvQkFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFFM0Qsa0JBQWUsTUFBTSxDQUFDIn0=
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481032, function(require, module, exports) {

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigator = exports.Navigator = exports.PathType = void 0;
var logger_1 = __importDefault(require("./logger"));
var utils_1 = require("./utils");
var paramsParsing = function (commonParams) {
    var path = commonParams.path, _a = commonParams.query, query = _a === void 0 ? {} : _a;
    var routerPath = typeof path === 'string' ? { path: path, type: PathType.NORMAL } : path;
    var urlQuery = utils_1.obj2Params(query);
    var urlQueryStr = urlQuery ? "?" + urlQuery : '';
    var toUrl = "" + routerPath.path + urlQueryStr;
    return {
        routerPath: routerPath,
        toUrl: toUrl,
    };
};
var PathType;
(function (PathType) {
    // 普通页面
    PathType["NORMAL"] = "normal";
    // 微信小程序原生tabBar页面
    PathType["TAB"] = "tab";
})(PathType = exports.PathType || (exports.PathType = {}));
var Navigator = /** @class */ (function () {
    function Navigator() {
        // 锁
        this.isClick = true;
        // 页面栈最大深度
        this.maxDeep = 10;
    }
    // 智能跳转应用内某页面
    Navigator.prototype.gotoPage = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var path, _a, query, routerPath, pageStack, pageStackLength, curDelta;
            return __generator(this, function (_b) {
                path = arg[0], _a = arg[1], query = _a === void 0 ? {} : _a;
                logger_1.default.debug('call gotoPage', { path: path, query: query });
                routerPath = paramsParsing({ path: path, query: query }).routerPath;
                // 页面为tab页面
                if (routerPath.type === PathType.TAB) {
                    return [2 /*return*/, this.switchTab.apply(this, arg)];
                }
                pageStack = getCurrentPages();
                pageStackLength = pageStack.length;
                curDelta = this.findPageInHistory(routerPath.path);
                if (pageStack.length >= this.maxDeep) {
                    // 当前页面：在页面栈中
                    if (curDelta > -1)
                        return [2 /*return*/, this.navigateBack({ delta: pageStackLength - curDelta })];
                    // 当前页面：不在页面栈中
                    return [2 /*return*/, this.redirectTo.apply(this, arg)];
                }
                return [2 /*return*/, this.navigateTo.apply(this, arg)];
            });
        });
    };
    /**
     * navigateTo
     * @param path 小程序页面真实路径
     * @param query 页面参数
     * @param options.events 页面间通信接口，用于监听被打开页面发送到当前页面的数据。
     */
    Navigator.prototype.navigateTo = function (path, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var toUrl;
            var _this = this;
            return __generator(this, function (_a) {
                this.checkIsClick();
                this.isClick = false;
                toUrl = paramsParsing({ path: path, query: query }).toUrl;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        wx.navigateTo({
                            url: toUrl,
                            events: options === null || options === void 0 ? void 0 : options.events,
                            success: function (arg) {
                                logger_1.default.log('navigateTo:success', 'navigateTo成功', { toUrl: toUrl });
                                resolve(arg);
                                _this.isClick = true;
                            },
                            fail: function (arg) {
                                logger_1.default.log('navigateTo:fail', 'navigateTo失败', arg);
                                reject(arg);
                                _this.isClick = true;
                            },
                        });
                    })];
            });
        });
    };
    /**
     * switchTab
     * @param path 小程序页面真实路径
     * @param query 页面参数
     */
    Navigator.prototype.switchTab = function (path, query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var toUrl;
            var _this = this;
            return __generator(this, function (_a) {
                this.checkIsClick();
                this.isClick = false;
                toUrl = paramsParsing({ path: path, query: query }).toUrl;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        wx.switchTab({
                            url: toUrl,
                            success: function (arg) {
                                logger_1.default.log('switchTab:success', 'switchTab成功', { toUrl: toUrl });
                                resolve(arg);
                                _this.isClick = true;
                            },
                            fail: function (arg) {
                                logger_1.default.log('switchTab:fail', 'switchTab失败', arg);
                                reject(arg);
                                _this.isClick = true;
                            },
                        });
                    })];
            });
        });
    };
    /**
     * redirectTo
     * @param path 小程序页面真实路径
     * @param query 页面参数
     */
    Navigator.prototype.redirectTo = function (path, query) {
        if (query === void 0) { query = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var toUrl;
            var _this = this;
            return __generator(this, function (_a) {
                this.checkIsClick();
                this.isClick = false;
                toUrl = paramsParsing({ path: path, query: query }).toUrl;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        wx.redirectTo({
                            url: toUrl,
                            success: function (arg) {
                                logger_1.default.log('redirectTo:success', 'redirectTo成功', { toUrl: toUrl });
                                resolve(arg);
                                _this.isClick = true;
                            },
                            fail: function (arg) {
                                logger_1.default.log('redirectTo:fail', 'redirectTo失败', arg);
                                reject(arg);
                                _this.isClick = true;
                            },
                        });
                    })];
            });
        });
    };
    /**
     * navigateBack
     * @param query.delta 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
     * @param option.setData 植入目标页面 data 的数据。
     */
    Navigator.prototype.navigateBack = function (query, option) {
        return __awaiter(this, void 0, void 0, function () {
            var pageStack, backPage;
            var _this = this;
            return __generator(this, function (_a) {
                this.checkIsClick();
                this.isClick = false;
                if (option === null || option === void 0 ? void 0 : option.setData) {
                    pageStack = getCurrentPages();
                    backPage = pageStack[pageStack.length - 1 - (query.delta || 1)];
                    backPage === null || backPage === void 0 ? void 0 : backPage.setData(option === null || option === void 0 ? void 0 : option.setData);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        wx.navigateBack({
                            delta: query.delta,
                            success: function (arg) {
                                resolve(arg);
                                _this.isClick = true;
                            },
                            fail: function (arg) {
                                logger_1.default.log('navigateBack:fail', 'navigateBack失败', arg);
                                reject(arg);
                                _this.isClick = true;
                            },
                        });
                    })];
            });
        });
    };
    Navigator.prototype.findPageInHistory = function (path) {
        var pageStack = getCurrentPages();
        var reg = /^\//;
        var delta = -1;
        // eslint-disable-next-line functional/no-loop-statement
        for (var i = 0; i < pageStack.length; i++) {
            var myRoute = pageStack[i].route;
            if (myRoute &&
                path &&
                myRoute.replace(reg, '') === path.replace(reg, '')) {
                delta = i + 1; // 目标页在栈中的位置
                break;
            }
        }
        return delta;
    };
    Navigator.prototype.checkIsClick = function () {
        if (this.isClick === false)
            throw new Error('req locked');
    };
    return Navigator;
}());
exports.Navigator = Navigator;
exports.navigator = new Navigator();
exports.default = exports.navigator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9uYXZpZ2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQThCO0FBQzlCLGlDQUFxQztBQU9yQyxJQUFNLGFBQWEsR0FBRyxVQUFDLFlBQTBCO0lBQ3ZDLElBQUEsSUFBSSxHQUFpQixZQUFZLEtBQTdCLEVBQUUsS0FBZSxZQUFZLE1BQWpCLEVBQVYsS0FBSyxtQkFBRyxFQUFFLEtBQUEsQ0FBa0I7SUFDMUMsSUFBTSxVQUFVLEdBQ2QsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVwRSxJQUFNLFFBQVEsR0FBRyxrQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLElBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBSSxRQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNuRCxJQUFNLEtBQUssR0FBRyxLQUFHLFVBQVUsQ0FBQyxJQUFJLEdBQUcsV0FBYSxDQUFDO0lBRWpELE9BQU87UUFDTCxVQUFVLFlBQUE7UUFDVixLQUFLLE9BQUE7S0FDTixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUYsSUFBWSxRQUtYO0FBTEQsV0FBWSxRQUFRO0lBQ2xCLE9BQU87SUFDUCw2QkFBaUIsQ0FBQTtJQUNqQixrQkFBa0I7SUFDbEIsdUJBQVcsQ0FBQTtBQUNiLENBQUMsRUFMVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUtuQjtBQUVEO0lBQUE7UUFDRSxJQUFJO1FBQ0ksWUFBTyxHQUFHLElBQUksQ0FBQztRQUV2QixVQUFVO1FBQ0YsWUFBTyxHQUFHLEVBQUUsQ0FBQztJQXdM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
}, function(modId) { var map = {"./logger":1647761481031,"./utils":1647761481033}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481033, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.urlStrToObj = exports.obj2Params = exports.setter = void 0;
var setter = function (obj, key, value) {
    var keys = key.split('.');
    var pres = keys.slice(0, -1);
    var last = keys[keys.length - 1];
    var deepObj = keys.length === 1
        ? obj
        : pres.reduce(function (curObj, curKey) {
            if (!curObj[curKey])
                curObj[curKey] = {};
            return curObj[curKey];
        }, obj);
    deepObj[last] = value;
    return obj;
};
exports.setter = setter;
var obj2Params = function (obj, encode) {
    if (obj === void 0) { obj = {}; }
    if (encode === void 0) { encode = false; }
    var result = [];
    Object.keys(obj).forEach(function (key) {
        return result.push(key + "=" + (encode ? encodeURIComponent(obj[key]) : obj[key]));
    });
    return result.join('&');
};
exports.obj2Params = obj2Params;
/**
 * 将url后的参数string转成object
 * @param str - query部分参数，如：abc=foo&def=%5Basf%5D&xyz=5
 */
var urlStrToObj = function (str, urlDeocde) {
    if (urlDeocde === void 0) { urlDeocde = false; }
    var cookedStr = urlDeocde ? decodeURIComponent(str) : str;
    cookedStr =
        '{"' +
            cookedStr.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') +
            '"}';
    return JSON.parse(cookedStr);
};
exports.urlStrToObj = urlStrToObj;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLElBQU0sTUFBTSxHQUFHLFVBQVksR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFnQjtJQUMxRCxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkMsSUFBTSxPQUFPLEdBQ1gsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLEdBQUc7UUFDTCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU0sRUFBRSxNQUFNO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN0QixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMsQ0FBQztBQWJXLFFBQUEsTUFBTSxVQWFqQjtBQUVLLElBQU0sVUFBVSxHQUFHLFVBQUMsR0FBUSxFQUFFLE1BQWM7SUFBeEIsb0JBQUEsRUFBQSxRQUFRO0lBQUUsdUJBQUEsRUFBQSxjQUFjO0lBQ2pELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7UUFDM0IsT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFJLEdBQUcsVUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUUsQ0FBQztJQUF6RSxDQUF5RSxDQUMxRSxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQztBQVBXLFFBQUEsVUFBVSxjQU9yQjtBQUVGOzs7R0FHRztBQUNJLElBQU0sV0FBVyxHQUFHLFVBQUMsR0FBVyxFQUFFLFNBQWlCO0lBQWpCLDBCQUFBLEVBQUEsaUJBQWlCO0lBQ3hELElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUUxRCxTQUFTO1FBQ1AsSUFBSTtZQUNKLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7WUFDeEUsSUFBSSxDQUFDO0lBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQztBQVJXLFFBQUEsV0FBVyxlQVF0QiJ9
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481034, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
var navigator_1 = __importDefault(require("./navigator"));
var Route = /** @class */ (function () {
    function Route(_a) {
        var routeUrl = _a.routeUrl;
        this.routeUrl = routeUrl;
    }
    Route.prototype.go = function (query) {
        return navigator_1.default.gotoPage(this.routeUrl, query);
    };
    Route.prototype.navigateTo = function (query) {
        return navigator_1.default.navigateTo(this.routeUrl, query);
    };
    Route.prototype.redirectTo = function (query) {
        return navigator_1.default.redirectTo(this.routeUrl, query);
    };
    Route.prototype.switchTab = function (query) {
        return navigator_1.default.switchTab(this.routeUrl, query);
    };
    return Route;
}());
exports.Route = Route;
exports.default = Route;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBEQUFvQztBQUVwQztJQUdFLGVBQVksRUFBWTtZQUFWLFFBQVEsY0FBQTtRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRU0sa0JBQUUsR0FBVCxVQUFVLEtBQWdCO1FBQ3hCLE9BQU8sbUJBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sMEJBQVUsR0FBakIsVUFBa0IsS0FBZ0I7UUFDaEMsT0FBTyxtQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSwwQkFBVSxHQUFqQixVQUFrQixLQUFnQjtRQUNoQyxPQUFPLG1CQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLHlCQUFTLEdBQWhCLFVBQWlCLEtBQWdCO1FBQy9CLE9BQU8sbUJBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBQ0gsWUFBQztBQUFELENBQUMsQUF0QkQsSUFzQkM7QUF0Qlksc0JBQUs7QUF3QmxCLGtCQUFlLEtBQUssQ0FBQyJ9
}, function(modId) { var map = {"./navigator":1647761481032}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481035, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
var path_to_regexp_1 = require("path-to-regexp");
var RouteMatcher = /** @class */ (function () {
    function RouteMatcher(path, route) {
        this.keys = [];
        // 匹配正则
        this.regex = null;
        // 真实路径
        this.route = null;
        this.regex = path_to_regexp_1.pathToRegexp(path, this.keys);
        this.route = route;
    }
    RouteMatcher.prototype.match = function (path) {
        var result = path.match(this.regex);
        if (!result)
            return undefined;
        var route = this.route;
        var params = {};
        // 若存在路由参数，解释
        if (this.keys[0]) {
            this.keys.forEach(function (key, index) {
                params[key.name] = result[index + 1];
            });
        }
        return {
            route: route,
            params: params,
        };
    };
    return RouteMatcher;
}());
exports.default = RouteMatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtbWF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvcm91dGUtbWF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUE4QztBQUU5QztJQVNFLHNCQUFZLElBQUksRUFBRSxLQUFLO1FBUmYsU0FBSSxHQUFHLEVBQUUsQ0FBQztRQUVsQixPQUFPO1FBQ0EsVUFBSyxHQUFHLElBQUksQ0FBQztRQUVwQixPQUFPO1FBQ0EsVUFBSyxHQUFHLElBQUksQ0FBQztRQUdsQixJQUFJLENBQUMsS0FBSyxHQUFHLDZCQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsNEJBQUssR0FBTCxVQUFNLElBQVk7UUFDaEIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLFNBQVMsQ0FBQztRQUU5QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pCLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVsQixhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEtBQUs7Z0JBQzNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTztZQUNMLEtBQUssT0FBQTtZQUNMLE1BQU0sUUFBQTtTQUNQLENBQUM7SUFDSixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBakNELElBaUNDIn0=
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481036, function(require, module, exports) {

/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable functional/no-return-void */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.landTransferDecorator = exports.LandTransfer = void 0;
var logger_1 = __importDefault(require("./logger"));
var navigator_1 = __importDefault(require("./navigator"));
var LandTransfer = /** @class */ (function () {
    function LandTransfer(params) {
        if (params === void 0) { params = {}; }
        if (params.convertSceneParams)
            this.convertSceneParams = params.convertSceneParams;
        if (params.gotoPage)
            this.gotoPage = params.gotoPage;
        if (params.router)
            this.router = params.router;
    }
    /**
     * 跳转引擎
     * @param path
     * @param query
     */
    LandTransfer.prototype.doGotoPage = function (path, query) {
        if (this.gotoPage)
            return this.gotoPage(path, query);
        if (this.router)
            return this.router.gotoPage(path, query);
        return navigator_1.default.gotoPage(path, query);
    };
    /**
     * 启动，跳转到目标页面。
     * 参数优先级：scene > path
     * @param options.scene 短链参数，会用 this.convertSceneParams 解析成 object
     * @param options.path 目标路径，会跳转到目标页面去，例：'/pages/home/index'
     */
    LandTransfer.prototype.run = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var scene, rest, params, _a, _b, _c, _d, _e, path, query, error_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 4, , 5]);
                        scene = options.scene, rest = __rest(options, ["scene"]);
                        params = { query: __assign({}, rest) };
                        if (!scene) return [3 /*break*/, 3];
                        if (!!this.convertSceneParams) return [3 /*break*/, 1];
                        logger_1.default.warn('缺少 convertSceneParams 函数，无法解析 scene =', scene);
                        return [3 /*break*/, 3];
                    case 1:
                        _a = params;
                        _c = (_b = Object).assign;
                        _d = [{},
                            params.query];
                        return [4 /*yield*/, this.convertSceneParams(scene)];
                    case 2:
                        _a.query = _c.apply(_b, _d.concat([_f.sent()]));
                        _f.label = 3;
                    case 3:
                        _e = params === null || params === void 0 ? void 0 : params.query, path = _e.path, query = __rest(_e, ["path"]);
                        if (!path)
                            throw new Error('path invalid');
                        return [2 /*return*/, this.doGotoPage(path, query)];
                    case 4:
                        error_1 = _f.sent();
                        logger_1.default.error('跳转失败', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return LandTransfer;
}());
exports.LandTransfer = LandTransfer;
function landTransferDecorator(landTransferParams) {
    return function transfer(_target, propertyName, descriptor) {
        if (propertyName !== 'onLoad') {
            throw new Error('landTransferDecorator only work on "onLoad"');
        }
        var landTransfer = new LandTransfer(landTransferParams);
        var originMethod = descriptor.value;
        descriptor.value = function onLoad(options) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, landTransfer.run(options)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            logger_1.default.error(error_2);
                            return [3 /*break*/, 3];
                        case 3: 
                        // 调用原来的方法
                        return [2 /*return*/, originMethod.call(this, options)];
                    }
                });
            });
        };
    };
}
exports.landTransferDecorator = landTransferDecorator;
exports.default = LandTransfer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZC10cmFuc2Zlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvbGFuZC10cmFuc2Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaURBQWlEO0FBQ2pELDhDQUE4QztBQUM5Qyx1REFBdUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFdkQsb0RBQThCO0FBQzlCLDBEQUFzRDtBQWlCdEQ7SUFLRSxzQkFBWSxNQUFnQztRQUFoQyx1QkFBQSxFQUFBLFdBQWdDO1FBQzFDLElBQUksTUFBTSxDQUFDLGtCQUFrQjtZQUMzQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO1FBQ3RELElBQUksTUFBTSxDQUFDLFFBQVE7WUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDckQsSUFBSSxNQUFNLENBQUMsTUFBTTtZQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGlDQUFVLEdBQWxCLFVBQW1CLElBQUksRUFBRSxLQUFLO1FBQzVCLElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxPQUFPLG1CQUFTLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDVSwwQkFBRyxHQUFoQixVQUFpQixPQUEyQzs7Ozs7Ozt3QkFFaEQsS0FBSyxHQUFjLE9BQU8sTUFBckIsRUFBSyxJQUFJLFVBQUssT0FBTyxFQUE1QixTQUFrQixDQUFGLENBQWE7d0JBQzdCLE1BQU0sR0FBRyxFQUFFLEtBQUssZUFBTyxJQUFJLENBQUUsRUFBRSxDQUFDOzZCQUdsQyxLQUFLLEVBQUwsd0JBQUs7NkJBQ0gsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQXhCLHdCQUF3Qjt3QkFDMUIsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozt3QkFFNUQsS0FBQSxNQUFNLENBQUE7d0JBQVMsS0FBQSxDQUFBLEtBQUEsTUFBTSxDQUFBLENBQUMsTUFBTSxDQUFBOzhCQUMxQixFQUFFOzRCQUNGLE1BQU0sQ0FBQyxLQUFLO3dCQUNaLHFCQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBSHRDLEdBQU8sS0FBSyxHQUFHLHdCQUdiLFNBQW9DLEdBQ3JDLENBQUM7Ozt3QkFJQSxLQUFxQixNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsS0FBSyxFQUFoQyxJQUFJLFVBQUEsRUFBSyxLQUFLLGNBQWhCLFFBQWtCLENBQUYsQ0FBbUI7d0JBQ3pDLElBQUksQ0FBQyxJQUFJOzRCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBRTNDLHNCQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFDOzs7d0JBRXBDLGdCQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFLLENBQUMsQ0FBQzt3QkFDNUIsTUFBTSxPQUFLLENBQUM7Ozs7O0tBRWY7SUFDSCxtQkFBQztBQUFELENBQUMsQUF4REQsSUF3REM7QUF4RFksb0NBQVk7QUEwRHpCLFNBQWdCLHFCQUFxQixDQUNuQyxrQkFBdUM7SUFFdkMsT0FBTyxTQUFTLFFBQVEsQ0FDdEIsT0FBWSxFQUNaLFlBQW9CLEVBQ3BCLFVBQWU7UUFFZixJQUFJLFlBQVksS0FBSyxRQUFRLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1NBQ2hFO1FBRUQsSUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUUxRCxJQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBRXRDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsU0FBZSxNQUFNLENBQUMsT0FBWTs7Ozs7Ozs0QkFHakQscUJBQU0sWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBQTs7NEJBQS9CLFNBQStCLENBQUM7Ozs7NEJBRWhDLGdCQUFNLENBQUMsS0FBSyxDQUFDLE9BQUssQ0FBQyxDQUFDOzs7d0JBR3RCLFVBQVU7d0JBQ1Ysc0JBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUM7Ozs7U0FDekMsQ0FBQztJQUNKLENBQUMsQ0FBQztBQUNKLENBQUM7QUE1QkQsc0RBNEJDO0FBRUQsa0JBQWUsWUFBWSxDQUFDIn0=
}, function(modId) { var map = {"./logger":1647761481031,"./navigator":1647761481032}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1647761481029);
})()
//miniprogram-npm-outsideDeps=["@jerryc/mini-logger","path-to-regexp"]
//# sourceMappingURL=index.js.map