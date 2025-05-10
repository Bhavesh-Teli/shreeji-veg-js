import axios from "axios";
import { API_END_POINT } from "../utils/constant";
import { IApprove } from "../types/IApprove";
import { getAuthHeaders } from "../utils/getAuthHeaders";

export const ApproveUser = async (userData: IApprove) => {
    try {
        const res = await axios.post(`${API_END_POINT}/approveUser`, userData, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Approving:', error)
        throw error;
    }
}

export const getUsersToApprove = async () => {
    try {
        const res = await axios.get(`${API_END_POINT}/getUnapprovedUsers`, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Fetching unApprove user:', error)
        throw error;
    }
}

export const GetUsersList = async () => {
    try {
        const res = await axios.get(`${API_END_POINT}/getUserList`, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Fetching UserList user:', error)
        throw error;
    }
}