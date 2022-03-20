module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1647761481024, function(require, module, exports) {

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
__exportStar(require("./lib/logger"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsK0NBQTZCIn0=
}, function(modId) {var map = {"./lib/logger":1647761481025}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1647761481025, function(require, module, exports) {

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.levelMapper = exports.Level = void 0;
var Level;
(function (Level) {
    Level[Level["ERROR"] = 1] = "ERROR";
    Level[Level["WARN"] = 2] = "WARN";
    Level[Level["INFO"] = 3] = "INFO";
    Level[Level["DEBUG"] = 4] = "DEBUG";
})(Level = exports.Level || (exports.Level = {}));
exports.levelMapper = (_a = {},
    _a["" + Level.ERROR] = 'error',
    _a["" + Level.WARN] = 'warn',
    _a["" + Level.INFO] = 'info',
    _a["" + Level.DEBUG] = 'debug',
    _a);
var Logger = /** @class */ (function () {
    function Logger(_a) {
        var _b = _a === void 0 ? {} : _a, prefix = _b.prefix, level = _b.level, titleTemplate = _b.titleTemplate, onLog = _b.onLog;
        this.level = Level.INFO;
        if (prefix)
            this.prefix = prefix;
        if (level)
            this.level = level;
        if (titleTemplate)
            this.titleTemplate = titleTemplate;
        if (onLog)
            this.onLog = onLog;
    }
    Logger.prototype.log = function (runtimeLevel, args) {
        if (runtimeLevel <= this.level) {
            var title = this.titleTemplate({
                prefix: this.prefix,
                level: runtimeLevel,
            });
            if (this.onLog)
                this.onLog(runtimeLevel, args);
            console[exports.levelMapper[runtimeLevel]].apply(console, __spreadArrays([title], args));
        }
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log(Level.ERROR, args);
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log(Level.WARN, args);
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log(Level.INFO, args);
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.log(Level.DEBUG, args);
    };
    Logger.prototype.titleTemplate = function (_a) {
        var prefix = _a.prefix, level = _a.level;
        return prefix
            ? "[" + prefix + ":" + exports.levelMapper[level] + "]"
            : "[" + exports.levelMapper[level] + "]";
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxJQUFZLEtBS1g7QUFMRCxXQUFZLEtBQUs7SUFDZixtQ0FBUyxDQUFBO0lBQ1QsaUNBQVEsQ0FBQTtJQUNSLGlDQUFRLENBQUE7SUFDUixtQ0FBUyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQUtoQjtBQUVZLFFBQUEsV0FBVztJQUN0QixHQUFDLEtBQUcsS0FBSyxDQUFDLEtBQU8sSUFBRyxPQUFPO0lBQzNCLEdBQUMsS0FBRyxLQUFLLENBQUMsSUFBTSxJQUFHLE1BQU07SUFDekIsR0FBQyxLQUFHLEtBQUssQ0FBQyxJQUFNLElBQUcsTUFBTTtJQUN6QixHQUFDLEtBQUcsS0FBSyxDQUFDLEtBQU8sSUFBRyxPQUFPO1FBQzNCO0FBRUY7SUFLRSxnQkFBWSxFQVVOO1lBVk0scUJBVVIsRUFBRSxLQUFBLEVBVEosTUFBTSxZQUFBLEVBQ04sS0FBSyxXQUFBLEVBQ0wsYUFBYSxtQkFBQSxFQUNiLEtBQUssV0FBQTtRQVJBLFVBQUssR0FBVSxLQUFLLENBQUMsSUFBSSxDQUFDO1FBZS9CLElBQUksTUFBTTtZQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ2pDLElBQUksS0FBSztZQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzlCLElBQUksYUFBYTtZQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ3RELElBQUksS0FBSztZQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxvQkFBRyxHQUFILFVBQUksWUFBbUIsRUFBRSxJQUFJO1FBQzNCLElBQUksWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDOUIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztnQkFDL0IsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2dCQUNuQixLQUFLLEVBQUUsWUFBWTthQUNwQixDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxLQUFLO2dCQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRS9DLE9BQU8sQ0FBQyxtQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQWxDLE9BQU8sa0JBQTRCLEtBQUssR0FBSyxJQUFJLEdBQUU7U0FDcEQ7SUFDSCxDQUFDO0lBRUQsc0JBQUssR0FBTDtRQUFNLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxxQkFBSSxHQUFKO1FBQUssY0FBTzthQUFQLFVBQU8sRUFBUCxxQkFBTyxFQUFQLElBQU87WUFBUCx5QkFBTzs7UUFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELHFCQUFJLEdBQUo7UUFBSyxjQUFPO2FBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztZQUFQLHlCQUFPOztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsc0JBQUssR0FBTDtRQUFNLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCw4QkFBYSxHQUFiLFVBQWMsRUFNYjtZQUxDLE1BQU0sWUFBQSxFQUNOLEtBQUssV0FBQTtRQUtMLE9BQU8sTUFBTTtZQUNYLENBQUMsQ0FBQyxNQUFJLE1BQU0sU0FBSSxtQkFBVyxDQUFDLEtBQUssQ0FBQyxNQUFHO1lBQ3JDLENBQUMsQ0FBQyxNQUFJLG1CQUFXLENBQUMsS0FBSyxDQUFDLE1BQUcsQ0FBQztJQUNoQyxDQUFDO0lBQ0gsYUFBQztBQUFELENBQUMsQUE5REQsSUE4REM7QUE5RFksd0JBQU0ifQ==
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1647761481024);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map