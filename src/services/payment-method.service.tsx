import { 
    IGroupedPaymentMethodsResponse, 
    IUpdatePaymentMethodRequest 
} from "@afx/interfaces/payment-method.iface";
import request from "@afx/utils/request.utils";

export const GetGroupedPaymentMethodsService = async () => {
    return await request<IGroupedPaymentMethodsResponse["data"]>({
        url: "payment-methods/grouped",
        method: "GET",
    });
};

export const UpdatePaymentMethodService = async (id: number, data: IUpdatePaymentMethodRequest) => {
    return await request({
        url: `payment-methods/${id}`,
        method: "PUT",
        data: data
    });
};
