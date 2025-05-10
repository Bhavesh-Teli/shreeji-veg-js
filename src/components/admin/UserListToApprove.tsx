import { useEffect, useRef, useState } from 'react';
import { Button, Input, message, Table, TableProps } from 'antd';
import { IColumns } from '../../types/IUserList';
import { ApproveUser, GetUsersList, getUsersToApprove } from '../../services/adminAPI';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';


const UserListToApprove = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<IColumns[]>([]);
    const [loading, setLoading] = useState(false);
    // const { token } = theme.useToken();
    const [activeTab, setActiveTab] = useState<'approved' | 'toApprove'>('approved');
    const inputRefs = useRef<Record<string, InputRef | null>>({});
    const location = useLocation();
    const number = location?.state?.mobile || null;
    const navigate = useNavigate();

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
        ...(activeTab === 'toApprove' ? [
            {
                title: "Password",
                dataIndex: 'Book_Pass',
                key: 'Book_Pass',
            },
        ] : []),

        // {
        //     title: t('AproveUser.code'),
        //     dataIndex: 'approvalCode',
        //     key: 'approvalCode',
        //     render: (_, record) => (

        //         <Input
        //             defaultValue={record.approvalCode || ''}
        //             style={{ width: 120 }}
        //             onChange={(e) => record.approvalCode = e.target.value}
        //             ref={(el) => {
        //                 if (record.Mobile_No === number && record.Id) {
        //                     inputRefs.current[record.Id] = el;
        //                 }
        //             }}
        //         />
        //     ),
        // },

        {
            title: t('AproveUser.code'),
            dataIndex: 'approvalCode',
            key: 'approvalCode',
            render: (_, record) => {
                if (activeTab === 'toApprove') {
                    return <span>{record.Ac_Code || '-'}</span>;
                }

                return (
                    <Input
                        defaultValue={record.approvalCode || ''}
                        style={{ width: 120 }}
                        onChange={(e) => (record.approvalCode = e.target.value)}
                        ref={(el) => {
                            if (record.Mobile_No === number && record.Id) {
                                inputRefs.current[record.Id] = el;
                            }
                        }}
                    />
                );
            },
        },
        {
            title: t('AproveUser.action'),
            key: 'action',
            render: (_, record) => {
                if (activeTab === 'toApprove') {
                    return <Button
                        size='small'
                        onClick={() =>
                            navigate('/add-orders', {
                                state: {
                                    Ac_Name: record.Ac_Name,
                                    Mobile_No: record.Mobile_No,
                                    Book_Pass: record.Book_Pass,
                                    Ac_Code: record.Ac_Code,
                                    Id: record.Id,
                                    Our_Shop_Ac: record.Our_Shop_Ac,
                                },
                            })
                        }
                    >
                        <PlusOutlined />
                    </Button >
                }
                <Button
                    type="primary"
                    onClick={() => record.Id && handleStatusChange(record.Id, record.approvalCode || '')}
                >
                    {t('AproveUser.approve')}
                </Button>
            },
        },
    ];

    const handleStatusChange = async (id: string, status: string) => {
        if (!status) {
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
            fetchUsers('toApprove');
        } catch (error) {
            console.error(t('AproveUser.statusError'), error);
            message.error(t('AproveUser.statusError'));
        }
    };


    const fetchUsers = async (type: 'approved' | 'toApprove') => {
        setLoading(true);
        try {
            let response;
            if (type === 'approved') {
                response = await getUsersToApprove(); // You need to define this API
            } else {
                response = await GetUsersList();
            }
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(activeTab);
    }, [activeTab]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', marginBottom: '16px' }}>
                <Button
                    type={activeTab === 'approved' ? 'primary' : 'default'}
                    onClick={() => setActiveTab('approved')}
                    style={{}}
                >
                    Approved List
                </Button>
                <Button
                    type={activeTab === 'toApprove' ? 'primary' : 'default'}
                    style={{ marginLeft: '8px' }}
                    onClick={() => setActiveTab('toApprove')}
                >
                    User List
                </Button>
            </div>
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
