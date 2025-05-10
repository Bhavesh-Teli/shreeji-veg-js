import axios from "axios";
import { API_END_POINT } from "../utils/constant";
import { getAuthHeaders } from "../utils/getAuthHeaders";

export const GetAllItems = async (lang: string) => {
    try {
        const res = await axios.get(`${API_END_POINT}/getAllItem`, {
            headers: getAuthHeaders(),
            params: { lang },
        })
        return res.data
    } catch (error) {
        console.error('Error While Fetching the all Veges:', error)
        throw error;
    }
}

export const GetFavorites = async (lang: string, id: string) => {
    console.log("lang", lang)
    try {
        const res = await axios.get(`${API_END_POINT}/getFavorites`, {
            headers: getAuthHeaders(),
            params: {
                lang,
                Ac_Id: id,
            },
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