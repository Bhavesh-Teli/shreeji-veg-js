import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { GetNotifaction } from '../../services/notificationAPI';

const Notifications = () => {
  interface Notification {
    Ac_Id: string;
    Cat: string;
    Noti_Date_Time: string;
    Noti: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Set false to skip spinner initially

  useEffect(() => {
    // You can uncomment this block when your API is ready
    const fetchNotifications = async () => {
      try {
        const response = await GetNotifaction();
        console.log("response", response);
        setNotifications(response.data);
      } catch {
        message.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div style={{ padding: '24px' }}>
      {loading ? (
        <Spin indicator={antIcon} />
      ) : (
        <Row gutter={[16, 16]}>
          {notifications && notifications.map((notification, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                title={`Order No: ${notification.Ac_Id}`}
                bordered={false}
                hoverable
              >
                <p><strong>Bill Date:</strong> {notification.Noti}</p>
                <p><strong>Account Name:</strong> {notification.Cat}</p>
                <p><strong>Time:</strong>  {notification.Noti_Date_Time.split("T")[1].split(".")[0]}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Notifications;
