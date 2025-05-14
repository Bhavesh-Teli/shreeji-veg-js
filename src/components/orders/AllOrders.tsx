import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Input, Space, DatePicker, Form, Button, message, Spin, theme } from "antd";
import { fetchAllVegetables, fetchFavoriteVegetables } from "../../redux/actions/vegesAction";
import { AppDispatch, RootState } from "../../redux/store";
import dayjs, { Dayjs } from "dayjs";
import { AddOrder, GetFreezeTime, GetLrNo, UpdateOrder } from "../../services/orderAPI";
import { Vegetable } from "../../redux/slice/vegesSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import 'dayjs/locale/en';
import 'dayjs/locale/hi';
import '../../locales/dayJs-gu.ts';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeHi from 'antd/es/date-picker/locale/hi_IN';

const AllOrders = () => {

  const { user } = useSelector((state: RootState) => state.auth) as { user: { Ac_Name?: string, isAdmin: boolean, Id: string, Our_Shop_Ac: boolean, Ac_Code: string } | null };
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { favorites, loading, all } = useSelector((state: RootState) => state.vegetables);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [billDate, setBillDate] = useState(dayjs().add(1, 'day'));
  const [lrNo, setLrNo] = useState<string | null>(null);
  const [billNo, SetBillNo] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<Vegetable[]>([]);
  const [mergedData, setMergedData] = useState<Vegetable[]>([]);
  const [addLoding, setAddLoding] = useState(false);
  const location = useLocation();
  const { orderData } = location.state || {};
  const userDetails = location?.state || null;
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [originalOrderItemIds, setOriginalOrderItemIds] = useState<number[]>([]);
  const [freezeTime, setFreezeTime] = useState(""); // State to track loading status

  const fetchFreezeTime = async () => {
    try {
      const response = await GetFreezeTime();
      setFreezeTime(response?.data?.freezeTime);
    } catch (error) {
      console.error("Error fetching freeze time:", error);
    }
  }

  useEffect(() => {
    fetchFreezeTime();
  }, [])

  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  // Return the right AntD locale
  const getAntdLocale = () => {
    switch (i18n.language) {
      case 'hi':
        return localeHi;
      case 'gu':
        return {
          ...localeEn,
          lang: {
            ...localeEn.lang,
            locale: 'gu',
            placeholder: 'તારીખ પસંદ કરો',
            yearPlaceholder: 'વર્ષ પસંદ કરો',
            monthPlaceholder: 'મહિનો પસંદ કરો',
            today: 'આજ',
          },
        };
      default:
        return localeEn;
    }
  };

  useEffect(() => {
    const normalizedAll = all.map(item => ({
      ...item,
      Itm_Id: item.Itm_ID,
    }));

    const map = new Map<number, Vegetable>();
    favorites.forEach(item => {
      if (item.Itm_Id !== undefined) {
        map.set(item.Itm_Id, item);
      }
    });
    normalizedAll.forEach(item => {
      if (item.Itm_Id !== undefined) {
        map.set(item.Itm_Id, item);
      }
    });

    const merged = Array.from(map.values());
    setMergedData(merged);

    // Initially show only favorites
    setFilteredData(favorites);
  }, [favorites, all]);

  useEffect(() => {

    const lowerSearch = searchText?.trim().toLowerCase() || "";

    if (isOrderMode) {
      const lowerSearch = searchText?.trim().toLowerCase() || "";

      // Maintain original order
      const orderItems = originalOrderItemIds
        .map(id => mergedData.find(item => item.Itm_Id === id))
        .filter((item): item is Vegetable => item !== undefined);
      // filter out undefined, if any

      if (lowerSearch) {
        const extraMatches = mergedData.filter(item =>
          item?.Itm_Name?.toLowerCase().includes(lowerSearch) &&
          !originalOrderItemIds.includes(item.Itm_Id ?? -1)
        );

        const merged = [...orderItems, ...extraMatches];
        setFilteredData(merged);
      } else {
        const quantityItems = mergedData.filter(item => {
          const quantity = item.Itm_Id !== undefined ? parseFloat(quantities[item.Itm_Id] || "0") : 0;
          return !originalOrderItemIds.includes(item.Itm_Id ?? -1) && quantity > 0;
        });

        const merged = [...orderItems, ...quantityItems];
        setFilteredData(merged);
      }

      return;
    }

    // normal search-based logic
    const searchMatched = mergedData.filter(item =>
      item?.Itm_Name?.toLowerCase().includes(lowerSearch)
    );

    const quantityItems = mergedData.filter(item => {
      const quantity = item.Itm_Id !== undefined ? parseFloat(quantities[item.Itm_Id] || "0") : 0;
      return quantity > 0;
    });

    const favoriteWithQuantity = favorites.filter(item => {
      const quantity = item.Itm_Id !== undefined ? parseFloat(quantities[item.Itm_Id] || "0") : 0;
      return quantity > 0 || item.Itm_Id === item.Itm_Id;
    });

    let merged = [];

    if (lowerSearch) {
      merged = [
        ...searchMatched,
        ...quantityItems.filter(item => !searchMatched.some(i => i.Itm_Id === item.Itm_Id)),
      ];
      setIsOrderMode(false);
    } else {
      merged = [
        ...favoriteWithQuantity,
        ...quantityItems.filter(item => !favoriteWithQuantity.some(i => i.Itm_Id === item.Itm_Id))
      ];
    }

    setFilteredData(merged);
  }, [searchText, mergedData, favorites, quantities, isOrderMode, originalOrderItemIds]);


  useEffect(() => {
    if (orderData && Array.isArray(orderData.Details)) {

      const initialQuantities: Record<string, string> = {};
      const updatedData: any[] = [];

      orderData.Details.forEach((item: any) => {
        if (item.Itm_Id !== undefined) {
          initialQuantities[item.Itm_Id] = item.Qty;
          updatedData.push({
            Itm_Id: item.Itm_Id,
            Itm_Name: item.Itm_Name,
            Uni_ID: item.Uni_ID,
            Uni_Name: item.Uni_Name,
          });
        }
      });

      setQuantities(initialQuantities);
      setFilteredData(updatedData);
      setIsOrderMode(true);
      setOriginalOrderItemIds(orderData.Details.map((item: { Itm_Id: number }) => item.Itm_Id));

      if (orderData.Bill_Date) {
        const formattedDate = dayjs(orderData.Bill_Date).format("DD-MM-YYYY");
        setBillDate(dayjs(formattedDate, "DD-MM-YYYY"));
      }

      SetBillNo(orderData.Bill_No || null);
      setLrNo(orderData.Order_Count || null);
    }
  }, [orderData]);

  useEffect(() => {
    dispatch(fetchFavoriteVegetables(userDetails ? userDetails?.Id : user?.Id));
    dispatch(fetchAllVegetables());
  }, [dispatch, userDetails, user]);


  const handleManualInput = (itemId: number, value: string) => {
    if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
      setQuantities((prev) => ({ ...prev, [itemId]: value }));
    }
  };

  const handleDateChange = async (date: dayjs.Dayjs | null) => {
    if (date) {
      const dateFormatted = date.format("YYYY-MM-DD");
      setBillDate(dayjs(dateFormatted));
      try {
        const formattedDate = date.format("YYYY-MM-DD");
        if (userDetails) {
          const res = await GetLrNo(formattedDate, userDetails.Id);
          setLrNo(res?.data?.Order_Count);
        }
        else {
          const res = await GetLrNo(formattedDate, user?.Id ?? "");
          setLrNo(res?.data?.Order_Count);
        }
      } catch {
        setLrNo(null);
      }
    }
  };

  useEffect(() => {
    if (!orderData) {
      handleDateChange(billDate);
    }
  }, [orderData]);

  const handleAddOrder = async () => {

    const details = [
      // 1. All favorites (quantity 0 or more)
      ...favorites
        .filter(item => item.Itm_Id !== undefined)
        .map(item => {
          const quantity = parseFloat(quantities[item.Itm_Id!] || "0");
          return {
            Itm_Id: item.Itm_Id!,
            Inward: quantity,
            Uni_ID: item.Uni_ID,
            Itm_Name: item.Itm_Name,
          };
        }),

      // 2. Any searched/merged item with quantity > 0 that is NOT already in favorites
      ...mergedData
        .filter(item =>
          item.Itm_Id !== undefined &&
          !favorites.some(fav => fav.Itm_Id === item.Itm_Id) &&
          parseFloat(quantities[item.Itm_Id!] || "0") > 0
        )
        .map(item => ({
          Itm_Id: item.Itm_Id!,
          Inward: parseFloat(quantities[item.Itm_Id!] || "0"),
          Uni_ID: item.Uni_ID,
          Itm_Name: item.Itm_Name,
        })),
    ];

    const allQuantitiesZero = details.every(item => item.Inward === 0);

    if (details.length === 0 || allQuantitiesZero) {
      message.warning(t('allOrders.addAtlestOne'));
      return;
    }

    const payload = {
      mode: "add",
      Ac_Id: userDetails ? userDetails?.Id : user?.Id,
      details,
      Ac_Code: user?.Ac_Code,
      Our_Shop_Ac: user?.Our_Shop_Ac,
      // Bill_No: billNo,
      Order_Count: lrNo,
      Bill_Date: billDate.format("YYYY-MM-DD"),
    };

    try {
      setAddLoding(true);
      await AddOrder(payload);
      setQuantities({});
      await handleDateChange(billDate);
      message.success(t('allOrders.orderAdded'));
      navigate("/");
    } catch (error) {
      message.error(t('allOrders.orderAddFailed'));
      console.error("Error while adding order: ", error);
    } finally {
      setAddLoding(false);
    }
  };


  const columns = [
    {
      title: t('allOrders.srNo'),
      key: "serial",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t('allOrders.itemName'),
      dataIndex: "Itm_Name",
      key: "Itm_Name",
    },
    {
      title: t('allOrders.groupName'),
      dataIndex: "IGP_NAME",
      key: "IGP_NAME",
    },
    {
      title: t('allOrders.quantity'),
      key: "quantity",
      render: (_: unknown, record: Vegetable) => (
        <Input
          placeholder="0"
          value={quantities[record.Itm_Id ?? ""] || ""}
          onChange={(e) => record.Itm_Id !== undefined && handleManualInput(record.Itm_Id, e.target.value)}
          size="small"
          className="custom-input"
        />
      ),
    },
    {
      title: t('allOrders.unit'),
      dataIndex: "Uni_Name",
      key: "Uni_Name",
    },

  ];

  const handleUpdateOrder = async (Id: string) => {
    if (!billNo || !lrNo) {
      message.error(t('allOrders.orderUpdateFailed'));
      return;
    }
    const details = filteredData
      .filter(item => item.Itm_Id !== undefined)
      .map(item => ({
        Itm_Id: item.Itm_Id!,
        Inward: parseFloat(quantities[item.Itm_Id!] || "0"),
        Uni_ID: item.Uni_ID,
        Itm_Name: item.Itm_Name,
      }));

    const payload = {
      mode: "edit",
      Ac_Id: orderData ? orderData?.Ac_Id : user?.Id,
      Ac_Code: orderData ? orderData?.Ac_Code : user?.Ac_Code,
      Our_Shop_Ac: orderData ? orderData?.Our_Shop_Ac : user?.Our_Shop_Ac,
      details,
      Id: Id,
      Order_Count: lrNo,
      Bill_Date: billDate.format("YYYY-MM-DD"),
    };
    try {
      setAddLoding(true);
      await UpdateOrder(payload);
      message.success(t('allOrders.orderUpdated'));
      navigate("/");
    } catch {
      message.error(t('allOrders.orderUpdateFailed'));
    } finally {
      setAddLoding(false);
    }
  };

  const disablePastDates = (current: Dayjs) => {
    if (!freezeTime) return false;

    const now = dayjs();
    const [freezeHour, freezeMinute, freezeSecond] = freezeTime.split(':').map(Number);

    const freezeMoment = now.clone().hour(freezeHour).minute(freezeMinute).second(freezeSecond);

    const logicalToday = now.isBefore(freezeMoment) ? now.subtract(1, 'day') : now;

    return current && current < logicalToday.endOf('day');
  };

  return (
    <div className="p-4">
      {addLoding ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <DatePicker
              locale={getAntdLocale()}
              value={billDate}
              onChange={handleDateChange}
              format="dddd, DD-MM-YYYY"
              size="small"
              disabledDate={disablePastDates}
            />

            <Form.Item label={t('allOrders.orderNo')} colon={false} style={{ marginBottom: 0 }}>
              <Input
                placeholder={(t('allOrders.orderNo'))}
                value={orderData ? billNo || "" : "New"}
                size="small"
                disabled
                style={{ fontWeight: "bold", color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
              />
            </Form.Item>

            <Form.Item label={t('allOrders.orderCount')} colon={false} style={{ marginBottom: 0 }}>
              <Input
                placeholder={(t('allOrders.orderCount'))}
                value={lrNo || ""}
                size="small"
                disabled
                style={{ fontWeight: "bold", color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
              />
            </Form.Item>
            {
              user && user.isAdmin &&
              <Form.Item label={"Account Name"} colon={false} style={{ marginBottom: 0 }}>
                <Input
                  placeholder={(t('allOrders.orderCount'))}
                  value={orderData?.Ac_Name || ""}
                  size="small"
                  disabled
                  style={{ fontWeight: "bold", color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
                />
              </Form.Item>
            }
          </div>

          <div className="flex flex-wrap gap-3 justify-start mt-4 mb-4">
            <Button type="primary" onClick={orderData ? () => handleUpdateOrder(orderData.Id) : handleAddOrder}>
              {orderData ? t('allOrders.updateOrder') : t('allOrders.updateOrder')}
            </Button>
            {
              <Button type="default" onClick={() => navigate("/")}>
                {t('allOrders.cancel')}
              </Button>
            }
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input.Search
              placeholder={t('allOrders.searchPlaceholder')}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              enterButton
            />

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: true }}
              bordered
              size="small"
            />
          </Space>
        </>
      )}
    </div>
  );

};

export default AllOrders;
