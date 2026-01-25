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
    serviceDetailFull: "services/:id/detail",
    serviceByCategory: "services/category/:categoryId",

    // Service Variants
    serviceVariants: "services/variants",
    serviceVariantsByService: "services/:serviceId/variants",
    serviceVariantDetail: "services/variants/:variantId",

    // Packages (Voucher)
    package: "packages",
    packageActive: "packages/active",
    packageDetail: "packages/:id",
    packageCheckName: "packages/check-name",

    // Credit Packages
    creditPackage: "credit-packages",
    creditPackageActive: "credit-packages/active",
    creditPackageDetail: "credit-packages/:id",
    creditPackageCheckName: "credit-packages/check-name",

    // Members
    member: "members",
    memberActive: "members/active",
    memberDetail: "members/:id",
    memberDetailFull: "members/:id/detail",
    memberCheckPhone: "members/check-phone",
    memberCheckEmail: "members/check-email",

    // Therapists
    therapist: "therapists",
    therapistActive: "therapists/active",
    therapistAvailable: "therapists/available",
    therapistDetail: "therapists/:id",
    therapistDetailFull: "therapists/:id/detail",
    therapistCheckPhone: "therapists/check-phone",

    // Rooms
    room: "rooms",
    roomActive: "rooms/active",
    roomAvailable: "rooms/available",
    roomDetail: "rooms/:id",
    roomDetailFull: "rooms/:id/detail",
    roomCheckName: "rooms/check-name",
}
