import { useEffect, useRef, useState } from 'react';
import { Button, Input, message, Table, TableProps, theme } from 'antd';
import { IColumns } from '../../types/IUserList';
import { ApproveUser, getUsersToApprove } from '../../services/adminAPI';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { InputRef } from 'antd';


const UserListToApprove = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<IColumns[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    
    const inputRefs = useRef<Record<string, InputRef | null>>({});
    const location = useLocation();
    const number = location?.state?.mobile || null;
    console.log("number", number);

    useEffect(() => {
        if (users.length > 0 && number) {
            const matchedUser = users.find(u => u.Mobile_No === number);
            if (matchedUser && matchedUser.Id) {
                const ref = inputRefs.current[matchedUser.Id];
                if (ref) {
                    ref.focus();
                }
            }
        }
    }, [users, number]);

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
        // {
        //     title: t('AproveUser.code'),
        //     dataIndex: 'approvalCode',
        //     key: 'approvalCode',
        //     render: (_, record) => (
        //         <Input
        //             defaultValue={record.approvalCode || ''}
        //             style={{ width: 120 }}
        //             onChange={(e) => record.approvalCode = e.target.value}
        //         />
        //     ),
        // },
        {
            title: t('AproveUser.code'),
            dataIndex: 'approvalCode',
            key: 'approvalCode',
            render: (_, record) => (
                <Input
                    defaultValue={record.approvalCode || ''}
                    style={{ width: 120 }}
                    onChange={(e) => record.approvalCode = e.target.value}
                    ref={(el) => {
                        if (record.Mobile_No === number && record.Id) {
                            inputRefs.current[record.Id] = el;
                        }
                    }}
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
        if(!status){
            message.warning('Please fill the approval code');
            return;
        }
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
