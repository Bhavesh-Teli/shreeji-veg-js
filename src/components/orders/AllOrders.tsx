import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Input, Space, DatePicker, Form, Button, message, Spin, theme, Select, TimePicker } from "antd";
import { fetchAllVegetables, fetchFavoriteVegetables } from "../../redux/actions/vegesAction";
import { AppDispatch, RootState } from "../../redux/store";
import dayjs, { Dayjs } from "dayjs";
import { AddOrder, GetFreezeTime, GetLrNo, GetUnits, UpdateOrder } from "../../services/orderAPI";
import { Vegetable } from "../../redux/slice/vegesSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import 'dayjs/locale/en';
import 'dayjs/locale/hi';
import '../../locales/dayJs-gu.ts';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeHi from 'antd/es/date-picker/locale/hi_IN';


// Define Unit type if not already imported
type Unit = {
  Uni_ID: number;
  Uni_Name: string;
};

const AllOrders = () => {

  const { user } = useSelector((state: RootState) => state.auth) as { user: { Ac_Name?: string, isAdmin: boolean, Id: string, Our_Shop_Ac: boolean, Ac_Code: string, Mobile_No?: string } | null };
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
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitSelections, setUnitSelections] = useState<{ [itemId: string]: number }>({});
  const [addedNonFavItemsOrder, setAddedNonFavItemsOrder] = useState<number[]>([]);
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [deliveryTime, setDeliveryTime] = useState<Dayjs | null>(null);

  const fetchUnits = async () => {
    const res = await GetUnits();
    setUnits(res.data);
  }
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
    fetchUnits();
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

  // original
  useEffect(() => {

    const lowerSearch = searchText?.trim().toLowerCase() || "";

    if (isOrderMode) {
      const lowerSearch = searchText?.trim().toLowerCase() || "";

      // Get orderItems once, in fixed order
      const orderItemsMap = new Map<number, Vegetable>();
      originalOrderItemIds.forEach(id => {
        const found = mergedData.find(item => item.Itm_Id === id);
        if (found) orderItemsMap.set(id, found);
      });

      const orderItems = Array.from(orderItemsMap.values());

      // Get quantity items (added after initial order), fixed once
      const quantityItemsMap = new Map<number, Vegetable>();
      addedNonFavItemsOrder.forEach(id => {
        if (!originalOrderItemIds.includes(id)) {
          const found = mergedData.find(item => item.Itm_Id === id);
          if (found) quantityItemsMap.set(id, found);
        }
      });

      const quantityItems = Array.from(quantityItemsMap.values());

      let merged: Vegetable[] = [];

      if (lowerSearch) {
        // Always do full search on mergedData
        const searchMatched = mergedData.filter(item =>
          item.Itm_Name?.toLowerCase().includes(lowerSearch)
        );

        // Make a Set of IDs already included (to avoid duplication)
        const existingIds = new Set<number>([
          ...orderItems.map(i => i.Itm_Id).filter((id): id is number => id !== undefined),
          ...quantityItems.map(i => i.Itm_Id).filter((id): id is number => id !== undefined),
        ]);

        // Get only those search results that are not already shown
        const extraMatches = searchMatched.filter(item => item.Itm_Id !== undefined && !existingIds.has(item.Itm_Id));

        // Merge all in consistent order
        merged = [...orderItems, ...quantityItems, ...extraMatches];
      } else {
        merged = [...orderItems, ...quantityItems];
      }

      setFilteredData(merged);
      return;
    }


    // normal search-based logic
    const searchMatched = mergedData.filter(item =>
      item?.Itm_Name?.toLowerCase().includes(lowerSearch)
    );

    const quantityItems: Vegetable[] = addedNonFavItemsOrder
      .map(id => mergedData.find(item => item.Itm_Id === id))
      .filter((item): item is Vegetable => item !== undefined);

    const favoriteWithQuantity = favorites.filter(item => {
      const quantity = item.Itm_Id !== undefined ? parseFloat(quantities[item.Itm_Id] || "0") : 0;
      return quantity > 0 || item.Itm_Id === item.Itm_Id;
    });

    const nonFavoriteSearchMatched = searchMatched.filter(
      item => !favoriteWithQuantity.some(fav => fav.Itm_Id === item.Itm_Id)
    );

    let merged = [];

    if (lowerSearch) {
      merged = [
        ...favoriteWithQuantity,
        ...quantityItems.filter(
          item =>
            !favoriteWithQuantity.some(fav => fav.Itm_Id === item.Itm_Id) &&
            !nonFavoriteSearchMatched.some(match => match.Itm_Id === item.Itm_Id)
        ),
        ...nonFavoriteSearchMatched,
      ];
      setIsOrderMode(false);
    } else {
      merged = [
        ...favoriteWithQuantity,
        ...quantityItems.filter(item => !favoriteWithQuantity.some(i => i.Itm_Id === item.Itm_Id))
      ];
    }

    setFilteredData(merged);

  }, [searchText, mergedData, favorites, quantities, isOrderMode, originalOrderItemIds, addedNonFavItemsOrder]);

  useEffect(() => {
    if (orderData && Array.isArray(orderData.Details)) {

      const initialQuantities: Record<string, string> = {};
      const updatedData: any[] = [];
      const initialUnits: Record<string, number> = {};

      orderData.Details.forEach((item: any) => {
        if (item.Itm_Id !== undefined) {
          initialQuantities[item.Itm_Id] = item.Qty;

          if (item.Uni_ID !== undefined) {
            initialUnits[item.Itm_Id] = item.Uni_ID;
          }

          updatedData.push({
            Itm_Id: item.Itm_Id,
            Itm_Name: item.Itm_Name,
            Uni_ID: item.Uni_ID,
            Uni_Name: item.Uni_Name,
          });
        }
      });

      setQuantities(initialQuantities);
      setUnitSelections(initialUnits);
      setFilteredData(updatedData);
      setIsOrderMode(true);
      setOriginalOrderItemIds(orderData.Details.map((item: { Itm_Id: number }) => item.Itm_Id));

      if (orderData.Bill_Date) {
        const formattedDate = dayjs(orderData.Bill_Date).format("DD-MM-YYYY");
        setBillDate(dayjs(formattedDate, "DD-MM-YYYY"));
      }

      SetBillNo(orderData.Bill_No || null);
      setLrNo(orderData.Order_Count || null);
      setAddress1(orderData.Address1 || "");
      setAddress2(orderData.Address2 || "");
      setDeliveryTime(orderData.DeliveryTime ? dayjs(orderData.DeliveryTime, "hh:mm A") : null);
    }
  }, [orderData]);

  useEffect(() => {
    dispatch(fetchFavoriteVegetables(userDetails ? userDetails?.Id : user?.Id));
    dispatch(fetchAllVegetables());
  }, [dispatch, userDetails, user]);

  useEffect(() => {
    if (isOrderMode) {
      dispatch(fetchFavoriteVegetables(userDetails ? userDetails?.orderData?.Ac_Id : user?.Id));
      dispatch(fetchAllVegetables());
    }
  }, [dispatch, userDetails, user, isOrderMode, orderData]);

  const handleManualInput = (itemId: number, value: string) => {
    if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
      setQuantities((prev) => ({ ...prev, [itemId]: value }));

      // Track the order of non-favorite items when quantity is added
      if (
        parseFloat(value) > 0 &&
        !addedNonFavItemsOrder.includes(itemId) &&
        !favorites.some(fav => fav.Itm_Id === itemId)
      ) {
        setAddedNonFavItemsOrder((prev) => [...prev, itemId]);
      }
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

    const favoriteOrdered = favorites
      .map(fav => mergedData.find(item => item.Itm_Id === fav.Itm_Id))
      .filter((item): item is Vegetable => item !== undefined);

    const nonFavOrdered = addedNonFavItemsOrder
      .map(id => mergedData.find(item => item.Itm_Id === id))
      .filter((item): item is Vegetable => item !== undefined);

    const orderedItems = [...favoriteOrdered, ...nonFavOrdered];

    const details = orderedItems
      .map(item => {
        const qty = parseFloat(quantities[item.Itm_Id!] || "0");
        const isFavorite = favorites.some(fav => fav.Itm_Id === item.Itm_Id);
        if (qty > 0 || isFavorite) {
          return {
            Itm_Id: item.Itm_Id,
            Inward: qty,
            Uni_ID: unitSelections[item.Itm_Id!] ?? item.Uni_ID,
            Itm_Name: item.Itm_Name,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const allQuantitiesZero = details.every(item => item.Inward === 0);

    if (details.length === 0 || allQuantitiesZero) {
      message.warning(t('allOrders.addAtlestOne'));
      return;
    }
    const payload = {
      mode: "add",
      Ac_Id: userDetails ? userDetails?.Id : user?.Id,
      details,
      Ac_Code: userDetails ? userDetails?.Ac_Code : user?.Ac_Code,
      Our_Shop_Ac: userDetails ? userDetails?.Our_Shop_Ac : user?.Our_Shop_Ac,
      Mobile_No: userDetails?.Mobile_No || user?.Mobile_No || "",
      Order_Count: lrNo,
      Bill_Date: billDate.format("YYYY-MM-DD"),
      Address1: address1,
      Address2: address2,
      DeliveryTime: deliveryTime?.format("HH:mm A") || "",
    };
    try {
      setAddLoding(true);
      await AddOrder(payload);
      setQuantities({});
      setUnitSelections({});
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
      key: "unit",
      render: (_: unknown, record: Vegetable) => {
        const selectedUnitId = unitSelections[record.Itm_Id ?? ""] ?? record.Uni_ID;

        return (
          <Select
            value={selectedUnitId}
            onChange={(value) => record.Itm_Id !== undefined && handleUnitChange(String(record.Itm_Id), value)}
            size="small"
            className="w-[70px]"
          >
            {units.map((unit) => (
              <Select.Option key={unit.Uni_ID} value={unit.Uni_ID}>
                {unit.Uni_Name}
              </Select.Option>
            ))}
          </Select>
        );
      },
    }


  ];
  const handleUnitChange = (itemId: string, unitId: number) => {
    setUnitSelections((prev) => ({ ...prev, [itemId]: unitId }));
  };

  const handleUpdateOrder = async (Id: string) => {
    setSearchText("");

    if (!billNo || !lrNo) {
      message.error(t('allOrders.orderUpdateFailed'));
      return;
    }
    setTimeout(async () => {
      const orderedItems = [...filteredData];

      const details = orderedItems
        .filter(item => {
          const qty = item.Itm_Id !== undefined ? parseFloat(quantities[item.Itm_Id] || "0") : 0;
          const isFavorite = favorites.some(fav => {
            return Number(fav.Itm_Id) === Number(item.Itm_Id);
          });
          return qty > 0 || isFavorite;
        })
        .map(item => {
          // const selectedUnitId = unitSelections[item.Itm_Id] ?? item.Uni_ID;
          const selectedUnitId = item.Itm_Id !== undefined ? (unitSelections[item.Itm_Id] ?? item.Uni_ID) : item.Uni_ID;
          return {
            Itm_Id: item.Itm_Id,
            Inward: parseFloat(quantities[item.Itm_Id!] || "0"),
            Uni_ID: selectedUnitId,
            Itm_Name: item.Itm_Name,
          };
        });

      const payload = {
        mode: "edit",
        Ac_Id: orderData ? orderData?.Ac_Id : user?.Id,
        Ac_Code: orderData ? orderData?.Ac_Code : user?.Ac_Code,
        Our_Shop_Ac: orderData ? orderData?.Our_Shop_Ac : user?.Our_Shop_Ac,
        Mobile_No: orderData?.Mobile_No || user?.Mobile_No || "",
        details,
        Id: Id,
        Order_Count: lrNo,
        Bill_Date: billDate.format("YYYY-MM-DD"),
        Address1: address1,
        Address2: address2,
        DeliveryTime: deliveryTime?.format("HH:mm A") || "",
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
    }, 100);
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

            <Form.Item label={t('allOrders.deliveryAddress1')} colon={false} style={{ marginBottom: 0 }}>
              <Input
                placeholder={t('allOrders.deliveryAddress1')}
                maxLength={50}
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                size="small"
                style={{ color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
              />
            </Form.Item>
            <Form.Item label={t('allOrders.deliveryAddress2')} colon={false} style={{ marginBottom: 0 }}>
              <Input
                placeholder={t('allOrders.deliveryAddress2')}
                maxLength={50}
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                size="small"
                style={{ color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
              />
            </Form.Item>
            <Form.Item label={t('allOrders.deliveryTime')} colon={false} style={{ marginBottom: 0 }}>
              <TimePicker
                value={deliveryTime}
                onChange={(time) => setDeliveryTime(time)}
                format="hh:mm A"
                use12Hours
                size="small"
                style={{ color: token.colorBgLayout === "White" ? "rgba(0, 0, 0, 0.85)" : "white" }}
              />
            </Form.Item>
            {
              user && user.isAdmin &&
              <Form.Item label={"Account Name"} colon={false} style={{ marginBottom: 0 }}>
                <Input
                  placeholder={(t('allOrders.orderCount'))}
                  value={orderData?.Ac_Name || userDetails?.Ac_Name}
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
              rowKey={(record) => record.Itm_Id?.toString() || ""}
              loading={loading}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: true }}
              bordered
              size="small"
            />
          </Space>
          <div className="flex flex-wrap gap-3 justify-start mt-1 mb-4">
            <Button type="primary" onClick={orderData ? () => handleUpdateOrder(orderData.Id) : handleAddOrder}>
              {orderData ? t('allOrders.updateOrder') : t('allOrders.updateOrder')}
            </Button>
            {
              <Button type="default" onClick={() => navigate("/")}>
                {t('allOrders.cancel')}
              </Button>
            }
          </div>
        </>
      )}
    </div>
  );

};

export default AllOrders;
