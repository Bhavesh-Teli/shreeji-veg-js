import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllVegetables,
    fetchFavoriteVegetables,
} from "../../redux/actions/vegesAction";
import { AppDispatch, RootState } from "../../redux/store";
import { Table, Input, Button, message, theme, Space } from "antd";
import { AddToFavorite, RemoveFavorite } from "../../services/vegesAPI";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Vegetable } from "../../redux/slice/vegesSlice";
import { useTranslation } from "react-i18next";

interface APIError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

const AllVeges = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { favorites, all, loading } = useSelector((state: RootState) => state.vegetables);
    const [searchText, setSearchText] = useState<string>("");
    const [filteredVeges, setFilteredVeges] = useState<Vegetable[]>([]);
    const { user } = useSelector((state: RootState) => state.auth) as { user: { Ac_Name?: string, isAdmin: boolean, Id: string, Our_Shop_Ac: boolean, Ac_Code: string } | null };
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;
    const allVeges: Vegetable[] = all || [];

    useEffect(() => {
        dispatch(fetchAllVegetables());

        if (user && !user.isAdmin) {
            dispatch(fetchFavoriteVegetables(user?.Id || ""));
        }
    }, [dispatch, user]);

    useEffect(() => {
        const filtered = allVeges.filter((veg: Vegetable) => {
            // If Itm_Name is null, include it only when there's no search text
            if (!veg.Itm_Name) {
                return searchText.trim() === ""; // show these only if search is empty
            }

            return veg.Itm_Name.toLowerCase().includes(searchText.toLowerCase());
        });

        setFilteredVeges(filtered);
    }, [searchText, allVeges]);

    const favoriteIds = favorites?.map((f: Vegetable) => f.Itm_Id) || [];

    const handleAddToFav = async (vege: Vegetable) => {
        try {
            const finalSortIndex = 0;
            if (vege.Itm_ID !== undefined) {
                await AddToFavorite(vege.Itm_ID, finalSortIndex);
            } else {
                message.error(t('vegetable.addError'));
            }
            dispatch(fetchFavoriteVegetables(user?.Id || ""));
            message.success(t('vegetable.addSuccess'));
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.response?.data?.message) {
                message.error(apiError.response.data.message);
            } else {
                message.error(t('vegetable.unactableError'));
            }
        }
    };

    const columns = [
        {
            title: t('vegetable.srNo'),
            key: "serial",
            render: (_: unknown, __: unknown, index: number) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: t('vegetable.name'),
            dataIndex: "Itm_Name",
            key: "Itm_Name",
            render: (text: string | null) => text ?? <span style={{ color: '#999' }}>N/A</span>,
        },
        {
            title: t('vegetable.groupName'),
            dataIndex: "IGP_NAME",
            key: "IGP_NAME",
            render: (text: string | null) => text ?? <span style={{ color: '#999' }}>N/A</span>,
        },
        ...(user && !user.isAdmin
            ? [
                {
                    title: t('vegetable.action'),
                    key: "action",
                    render: (_: unknown, record: Vegetable) => {
                        const isFavorite = favoriteIds.includes(record.Itm_ID);
                        return isFavorite ? (
                            <Button danger onClick={() => handleRemoveFav(record)}>
                                <DeleteOutlined />
                            </Button>
                        ) : (
                            <Button type="primary" onClick={() => handleAddToFav(record)}>
                                <PlusOutlined />
                            </Button>
                        );
                    },
                },
            ]
            : []),
    ];

    const handleRemoveFav = async (vege: Vegetable) => {
        try {
            if (vege.Itm_ID !== undefined) {
                await RemoveFavorite(vege.Itm_ID);
            } else {
                message.error(t('vegetable.addError'));
            }
            dispatch(fetchFavoriteVegetables(user?.Id || ""));
            message.success(t('vegetable.removeSuccess'));
        } catch {
            message.error(t('vegetable.removeError'));
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className={token.colorBgLayout === "White" ? "BgTextBefore" : "BgText"}>{t('vegetable.title')}</h2>
                {
                    user && !user.isAdmin &&
                    <Button onClick={() => navigate("/favourites")} type="primary">{t('vegetable.viewFavorite')}</Button>
                }
            </div>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Input.Search
                    placeholder={t('vegetable.searchPlaceholder')}
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    value={searchText}
                    enterButton
                />

                <Table
                    columns={columns}
                    dataSource={filteredVeges}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        onChange: (page) => setCurrentPage(page),
                    }}
                    scroll={{ x: true }}
                    bordered
                    size="small"
                />
            </Space>
        </div>
    );
};

export default AllVeges;
