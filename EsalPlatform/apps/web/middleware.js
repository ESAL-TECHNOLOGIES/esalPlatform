"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
exports.config = void 0;
exports.middleware = middleware;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var protectedRoutes = [
    "/dashboard",
    "/profile",
    "/organizations/new",
    "/programs/new",
];
var authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];
function middleware(request) {
    return __awaiter(this, void 0, void 0, function () {
        var response, supabase, session, path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    response = server_1.NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
                        cookies: {
                            get: function (name) {
                                var _a;
                                return (_a = request.cookies.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                            },
                            set: function (name, value, options) {
                                response.cookies.set(__assign({ name: name, value: value }, options));
                            },
                            remove: function (name, options) {
                                response.cookies.set(__assign({ name: name, value: "" }, options));
                            },
                        },
                    });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    session = (_a.sent()).data.session;
                    path = request.nextUrl.pathname;
                    // Redirect authenticated users trying to access auth pages back to dashboard
                    if (session && authRoutes.some(function (route) { return path.startsWith(route); })) {
                        return [2 /*return*/, server_1.NextResponse.redirect(new URL("/dashboard", request.url))];
                    }
                    // Redirect unauthenticated users trying to access protected routes to login
                    if (!session && protectedRoutes.some(function (route) { return path.startsWith(route); })) {
                        return [2 /*return*/, server_1.NextResponse.redirect(new URL("/auth/login", request.url))];
                    }
                    return [2 /*return*/, response];
            }
        });
    });
}
exports.config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        // - api (API routes)
        // - public folder
        "/((?!_next/static|_next/image|favicon.ico|api|public).*)",
    ],
};
