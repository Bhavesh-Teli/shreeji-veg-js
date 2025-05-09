import { useEffect, useState } from 'react';
import { Button, Input, message, Table, TableProps, theme } from 'antd';
import { IColumns } from '../../types/IUserList';
import { ApproveUser, getUsersToApprove } from '../../services/adminAPI';
import { useTranslation } from 'react-i18next';


const UserListToApprove = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<IColumns[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();

    const columns: TableProps<IColumns>['columns'] = [
        {
            title: t('AproveUser.name'),
            dataIndex: 'Ac_Name',
            key: 'Ac_Name',
        },
        {
            title: t('AproveUser.mobile'),
            dataIndex: 'Mobile_No',
            key: 'Mobile_No',
        },
        {
            title: t('AproveUser.code'),
            dataIndex: 'approvalCode',
            key: 'approvalCode',
            render: (_, record) => (
                <Input
                    defaultValue={record.approvalCode || ''}
                    style={{ width: 120 }}
                    onChange={(e) => record.approvalCode = e.target.value}
                />
            ),
        },
        {
            title: t('AproveUser.action'),
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => record.Id && handleStatusChange(record.Id, record.approvalCode || '')}
                >
                    {t('AproveUser.approve')}
                </Button>
            ),
        },
    ];

    const handleStatusChange = async (id: string, status: string) => {

        try {
            const payload = {
                Ac_Id: id,
                approvalCode: status,
            };
            await ApproveUser(payload);
            message.success(t('AproveUser.statusSuccess'));
            fetchUsers();
        } catch (error) {
            console.error(t('AproveUser.statusError'), error);
            message.error(t('AproveUser.statusError'));
        }
    };


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsersToApprove();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: "10px" }} className={token.colorBgLayout === "White" ? "BgTextBefore" : "BgText"}>{t('AproveUser.title')}</h2>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 20 }}
                bordered
                scroll={{ x: 'max-content' }}
                size='small'
            />
        </div>
    );
};

export default UserListToApprove;
