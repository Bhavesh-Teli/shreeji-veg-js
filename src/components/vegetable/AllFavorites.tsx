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


    const favoriteVeges = favorites || [];

    useEffect(() => {
        dispatch(fetchFavoriteVegetables());
    }, [dispatch]);

    useEffect(() => {
        const filtered = favoriteVeges.filter((veg: Vegetable) =>
            veg.Itm_Name.toLowerCase().includes(searchText.toLowerCase())
        );

        if (JSON.stringify(filtered) !== JSON.stringify(filteredVeges)) {
            setFilteredVeges(filtered);
        }
    }, [searchText, favoriteVeges]);


    const columns = [
        {
            title: t('favorite.srNo'),
            key: "serial",
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            title: t('favorite.name'),
            dataIndex: "Itm_Name",
            key: "Itm_Name",
        },
        {
            title: "Group Name",
            dataIndex: "IGP_NAME",
            key: "IGP_NAME",
        },
        {
            title: t('favorite.action'),
            // title: "Action",
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
        dispatch(fetchFavoriteVegetables());
        message.success(t('favorite.removeSuccess'));
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className={token.colorBgLayout === "White" ? "BgTextBefore" : "BgText"}>{t('favorite.title')}</h2>
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
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: true }}
                    bordered
                    size="small"
                />
            </Space>
        </div>
    );
};

export default FavoriteVeges;
