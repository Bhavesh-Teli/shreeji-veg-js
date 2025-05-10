import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message, Button, Checkbox, Modal } from 'antd';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { GetNotifaction } from '../../services/notificationAPI';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  interface Notification {
    Id?: string;
    Ac_Id: string;
    Cat: string;
    Noti_Date_Time: string;
    Noti: string;
    extractedDates: string | null;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Set false to skip spinner initially
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [category, setCategory] = useState<string>('All');
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  console.log("notifications", notifications);

  // const str = notifications[0]?.Noti;
  // const regex = /order (\d+)/;
  // const match = str ? str.match(regex) : null; // Handle case when str is undefined or null

  // const billNo = match ? match[1] : null;
  // const billNo = notifications.map(notification => {
  //   const str = notification?.Noti; // Access each notification's Noti field
  //   const regex = /order (\d+)/; // Regex to capture the order number
  //   const match = str ? str.match(regex) : null; // Apply regex to extract the BillNo

  //   return match ? match[1] : null; // Return the BillNo if match is found, else return null
  // });

  // console.log("billNo", billNo);
  // console.log("category", category);

  useEffect(() => {
    // Fetch notifications when the component mounts
    const fetchNotifications = async () => {
      try {
        const response = await GetNotifaction();
        // console.log("response", response);
        const sortedNotifications = response.data.sort((a: Notification, b: Notification) => {
          return new Date(b.Noti_Date_Time).getTime() - new Date(a.Noti_Date_Time).getTime();
        });

        setNotifications(sortedNotifications);
        setFilteredNotifications(sortedNotifications);
      } catch {
        message.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (category === 'All') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(notification => notification.Cat === category));
    }
  }, [category, notifications]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const getCardTitle = (category: string) => {
    // console.log("category2", category);
    if (category === 'New User') return 'User';
    if (category === 'Order') return 'Order';
    return 'Notification'; // Default title if it's neither "New user" nor "Order"
  };

  const handleCardClick = (category: string, noti: string) => {
    console.log("notification", noti);
    if (category === 'New User') {
      const str = noti;
      const mobile = str.match(/\b\d{10}\b/)
      navigate('/user/list', {
        state: {
          mobile: mobile ? mobile[0] : null,
        },
      });
    } else if (category === 'Order') {
      console.log("category", category);
      const str = noti;
      console.log("str: ", str);
      const regex = /order (\d+)/;
      const match = str ? str.match(regex) : null;
      const billNo = match ? match[1] : null;
      // Extract date in YYYY-MM-DD format
      const dateRegex = /\d{4}-\d{2}-\d{2}/;
      const dateMatch = str.match(dateRegex);
      const orderDate = dateMatch ? dateMatch[0] : null;
      console.log("orderDate", orderDate);
      console.log("billNo", billNo);
      if (billNo) {
        navigate('/', {
          state: {
            billNo,
            orderDate,
          },
        });
      }
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const updated = checked ? [...prev, id] : prev.filter(item => item !== id);
      return updated;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      message.warning("Please select at least one notification.");
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete these notifications?',
      content: `This will permanently delete ${selectedIds.length} notification(s).`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // await DeleteNotifications(selectedIds);
          message.success("Notifications deleted successfully");
          console.log("checkedIds", selectedIds);
          const updated = notifications.filter(n => !selectedIds.includes(n.Id ?? ''));
          setNotifications(updated);
          setFilteredNotifications(
            category === "All"
              ? updated
              : updated.filter(n => n.Cat === category)
          );
          setSelectedIds([]);
        } catch {
          message.error("Failed to delete notifications");
        }
      },
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Left side buttons */}
        <div>
          <Button
            type={category === 'All' ? 'primary' : 'default'}
            onClick={() => setCategory('All')}
          >
            All
          </Button>
          <Button
            type={category === 'New User' ? 'primary' : 'default'}
            onClick={() => setCategory('New User')}
            style={{ marginLeft: '8px' }}
          >
            User
          </Button>
          <Button
            type={category === 'Order' ? 'primary' : 'default'}
            onClick={() => setCategory('Order')}
            style={{ marginLeft: '8px' }}
          >
            Order
          </Button>
        </div>

        {/* Right side delete button */}
        <Button
          danger
          onClick={handleDelete}
        >
          <DeleteOutlined />
        </Button>
      </div>

      {loading ? (
        <Spin indicator={antIcon} />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredNotifications && filteredNotifications.map((notification, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                // title={category === "Order" ? `Order` : `New User`}
                title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{getCardTitle(notification.Cat)}</span>
                  <Checkbox
                    checked={notification.Id ? selectedIds.includes(notification.Id) : false}
                    onClick={(e) => e.stopPropagation()} // Prevent card click
                    onChange={(e) => handleCheckboxChange(notification.Id ?? '', e.target.checked)}
                  />
                </div>}
                bordered={false}
                hoverable
                onClick={() => handleCardClick(notification.Cat, notification.Noti)}
              >
                <p><strong>Message:</strong> {notification?.Noti}</p>
                <p><strong>Time:</strong>{new Date(notification.Noti_Date_Time).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}</p>
              </Card>
            </Col>
          ))}
          {filteredNotifications.length === 0 && (
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: 'center' }}>
                <p>No notifications available</p>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default Notifications;
