"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cloud = require("wx-server-sdk");
var Base = /** @class */ (function () {
    function Base(Model) {
        if (typeof Model.$collection !== 'string') {
            throw Error('Model 需要增加 $collection 静态属性，用于绑定集合名称');
        }
        var openid = cloud.getWXContext().OPENID;
        this.collection = Model.$collection;
        this.openid = openid;
    }
    Object.defineProperty(Base.prototype, "model", {
        get: function () {
            var db = cloud.database();
            return db.collection(this.collection);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "command", {
        get: function () {
            var db = cloud.database();
            return db.command;
        },
        enumerable: false,
        configurable: true
    });
    return Base;
}());
exports.default = Base;
