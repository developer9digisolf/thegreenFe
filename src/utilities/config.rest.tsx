export const rest = {
    // Auth
    authLogin: "auth/login",
    authRegister: "auth/register",
    authMe: "auth/me",
    authValidate: "auth/validate",
    authLogout: "auth/logout",

    // Service Categories
    serviceCategory: "service-categories",
    serviceCategoryActive: "service-categories/active",
    serviceCategoryCheckName: "service-categories/check-name",
    serviceCategoryDetail: "service-categories/:id",
    serviceCategoryWithServices: "service-categories/:id/services",

    // Services
    service: "services",
    serviceActive: "services/active",
    serviceDetail: "services/:id",
    serviceByCategory: "services/category/:categoryId",
}
