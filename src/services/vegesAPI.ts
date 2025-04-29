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

export const GetAllItems = async () => {
    try {
        const res = await axios.get(`${API_END_POINT}/getAllItem`, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Fetching the all Veges:', error)
        throw error;
    }
}

export const GetFavorites = async () => {
    try {
        const res = await axios.get(`${API_END_POINT}/getFavorites`, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Fetching the all Favorites:', error)
        throw error;
    }
}


export const AddToFavorite = async (userData: number) => {
    try {
        const res = await axios.post(`${API_END_POINT}/addToFavorites`, { Itm_Id: userData }, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Adding the Favorites:', error)
        throw error;
    }
}

export const RemoveFavorite = async (userData: number) => {
    try {
        const res = await axios.post(`${API_END_POINT}/deleteFavorites`, { Itm_Id: userData }, {
            headers: getAuthHeaders(),
        })
        return res.data
    } catch (error) {
        console.error('Error While Deleting the Favorites:', error)
        throw error;
    }
}