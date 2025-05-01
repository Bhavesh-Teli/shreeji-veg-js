import axios from "axios";
import Cookies from "js-cookie";
import { API_END_POINT } from "../utils/constant";
const getAuthHeaders = () => {
    const token = Cookies.get('Shreeji_Veg');
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

export const GetLrNo = async (userData: string) => {
    try {
        const res = await axios.post(`${API_END_POINT}/getLrNo`, { Bill_Date: userData }, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While getting the LR No:', error)
        throw error;
    }
}

export const GetBillNo = async () => {
    try {
        const res = await axios.get(`${API_END_POINT}/getBillNo`, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While getting the Bill No:', error)
        throw error;
    }
}

export const AddOrder = async (payload: any) => {
    console.log("payload", payload);
    try {
        const res = await axios.post(`${API_END_POINT}/insertSalePurMain`, payload, {
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (error) {
        console.error("Error while adding order:", error);
        throw error;
    }
};

export const GetOrder = async (payload: any) => {
    console.log("payload", payload);
    try {
        const res = await axios.get(`${API_END_POINT}/OrderData`, {
            headers: getAuthHeaders(),
            params: payload,
        });
        return res.data;
    } catch (error) {
        console.error("Error while Getting orders:", error);
        throw error;
    }
};


export const Deleteorder = async (id: string) => {
    try {
        const res = await axios.delete(`${API_END_POINT}/deleteOrder`, {
            headers: getAuthHeaders(),
            data: { Bill_No: id },
        });
        return res.data;
    } catch (error) {
        console.error('Error while Deleting Order:', error);
        throw error;
    }
}
