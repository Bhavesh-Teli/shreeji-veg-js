import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteVegetables } from "../../redux/actions/vegesAction";
import { AppDispatch, RootState } from "../../redux/store";
import { Table, Input, Space, Button, message, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { RemoveFavorite } from "../../services/vegesAPI";
import { DeleteOutlined } from "@ant-design/icons";
import { Vegetable } from "../../redux/slice/vegesSlice";
import { useTranslation } from "react-i18next";

const FavoriteVeges = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { favorites, loading } = useSelector((state: RootState) => state.vegetables);
    const [searchText, setSearchText] = useState("");
    const [filteredVeges, setFilteredVeges] = useState<Vegetable[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useSelector((state: RootState) => state.auth) as { user: { Ac_Name?: string, isAdmin: boolean, Id: string, Our_Shop_Ac: boolean, Ac_Code: string } | null };
    const pageSize = 20;

    const favoriteVeges = favorites || [];

    useEffect(() => {
        dispatch(fetchFavoriteVegetables(user?.Id || ""));
    }, [dispatch, user]);

    useEffect(() => {
        const filtered = favoriteVeges.filter((veg: Vegetable) => {
            // If Itm_Name is null, include it only when there's no search text
            if (!veg.Itm_Name) {
                return searchText.trim() === ""; // show these only if search is empty
            }

            return veg.Itm_Name.toLowerCase().includes(searchText.toLowerCase());
        });

        setFilteredVeges(filtered);
    }, [searchText, favoriteVeges]);


    const columns = [
        {
            title: t('favorite.srNo'),
            key: "serial",
            render: (_: unknown, __: unknown, index: number) =>
                (currentPage - 1) * pageSize + index + 1,
        },
        {
            title: t('favorite.name'),
            dataIndex: "Itm_Name",
            key: "Itm_Name",
            render: (text: string | null) => text ?? <span style={{ color: '#999' }}>N/A</span>,
        },
        {
            title: t('favorite.groupName'),
            dataIndex: "IGP_NAME",
            key: "IGP_NAME",
            render: (text: string | null) => text ?? <span style={{ color: '#999' }}>N/A</span>,
        },
        {
            title: t('favorite.action'),
            key: "action",
            render: (_: unknown, record: Vegetable) => (
                <Button danger onClick={() => handleRemoveFav(record)}>
                    <DeleteOutlined />
                </Button>
            ),
        },
    ];

    const handleRemoveFav = async (record: Vegetable) => {
        if (record.Itm_Id !== undefined) {
            await RemoveFavorite(record.Itm_Id);
        } else {
            message.error(t('favorite.removeError'));
        }
        dispatch(fetchFavoriteVegetables(user?.Id || ""));
        message.success(t('favorite.removeSuccess'));
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-center items-center gap-2">
                    <h2 className={token.colorBgLayout === "White" ? "BgTextBefore" : "BgText"}>{t('favorite.title')}: {favoriteVeges.length}</h2>
                </div>
                <Button onClick={() => navigate("/all/veges")} type="primary">{t('favorite.addOrView')}</Button>
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
                <Input.Search
                    placeholder={t('favorite.searchPlaceholder')}
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    enterButton
                />

                <Table
                    columns={columns}
                    dataSource={filteredVeges}
                    rowKey={(record) => record.Itm_Id ?? ``}
                    loading={loading}
                    pagination={{
                        pageSize,
                        current: currentPage,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                    }}
                    scroll={{ x: true }}
                    bordered
                    size="small"
                />
            </Space>
        </div>
    );
};

export default FavoriteVeges;
