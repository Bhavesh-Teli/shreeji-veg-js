import { Button, Card, Col, Form, Input, message, Row } from "antd";
import { UserOutlined, LockOutlined, SafetyOutlined, MobileOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterApi, RequestOTP } from "../../services/authAPI";
import { useTranslation } from "react-i18next";

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [form] = Form.useForm();
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState<number | null>(null);
    const { t, i18n } = useTranslation();

    const normalizePhoneNumber = (input: string): string => {
        const hindiNums = "०१२३४५६७८९";
        const gujaratiNums = "૦૧૨૩૪૫૬૭૮૯";
        return input
            .split("")
            .map(char => {
                if (hindiNums.includes(char)) {
                    return hindiNums.indexOf(char).toString();
                }
                if (gujaratiNums.includes(char)) {
                    return gujaratiNums.indexOf(char).toString();
                }
                return char;
            })
            .join("");
    };

    useEffect(() => {
        const lang = localStorage.getItem("appLanguage") || "en";
        i18n.changeLanguage(lang);
    }, [i18n]);

    interface APIError {
        response?: {
            data?: {
                message?: string;
            };
        };
    }

    const handleSubmit = async (values: any) => {
        if (!otpSent) {
            message.warning(t("Regester.otpRequestWarning"));
            return;
        }
        values.Mobile_No = normalizePhoneNumber(values.Mobile_No);
        try {
            setLoading(true);
            await RegisterApi(values);
            message.success(t("Regester.registrationSuccess"));
            navigate("/login");
        } catch (error) {
            const apiError = error as APIError;
            if (apiError.response?.data?.message) {
                message.error(apiError.response.data.message);
            } else {
                message.error(t("Regester.unexpectedError"));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async () => {
        const values = await form.validateFields(["Mobile_No", "Ac_Name"]);
        if (!values.Mobile_No) {
            message.warning(t("Regester.enterMobileWarning"));
            return;
        }
        setOtpLoading(true);
        setTimer(300);

        // clear old interval if any
        if (intervalId) clearInterval(intervalId);

        const id = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setIntervalId(id);

        try {
            await RequestOTP({mobileNo: values.Mobile_No, Ac_Name: values.Ac_Name});
            message.success(t("Regester.otpSentSuccess"));
            setOtpSent(true);
        } catch {
            message.error(t("Regester.otpSendFail"));
        }
        setOtpLoading(false);
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5',
                padding: 16,
            }}
        >
            <Card style={{ width: '100%', maxWidth: 1000, padding: 20 }}>
                <Row gutter={[32, 16]} align="middle" justify="center">
                    <Col xs={24} md={12}>
                        <img
                            src="/01.png"
                            alt="Register"
                            style={{
                                width: '100%',
                                maxHeight: 300,
                                objectFit: "contain",
                                borderRadius: 8,
                            }}
                        />
                    </Col>

                    <Col xs={24} md={12}>
                        <Form
                            name="registerForm"
                            layout="vertical"
                            onFinish={handleSubmit}
                            autoComplete="off"
                            form={form}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={t("Regester.userName")}
                                        name="Ac_Name"
                                        rules={[{ required: true, message: t("Regester.userName") + t("Regester.is required") }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder={t("Regester.userName")} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={t("Regester.mobileNumber")}
                                        name="Mobile_No"
                                        rules={[
                                            {
                                                required: true,
                                                message: t("Regester.mobileNumber") + " " + t("Regester.is required"),
                                            },
                                            {
                                                validator: (_, value) => {
                                                    const normalized = normalizePhoneNumber(value || "");
                                                    if (/^\d{10}$/.test(normalized)) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error(t("Regester.Mobile Number Should be 10 Digits")));
                                                }
                                            }
                                        ]}
                                    >
                                        <Input
                                            prefix={<MobileOutlined />}
                                            placeholder={t("Regester.mobileNumber")}
                                            size="large"
                                        />
                                    </Form.Item>

                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={t("Regester.password")}
                                        name="Book_Pass"
                                        rules={[
                                            { required: true, message: t("Regester.password") + t("Regester.is required") },
                                            {
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{5,20}$/,
                                                message: t("Regester.Password: 5-20 chars, 1 upper, 1 lower & 1 special!")
                                            }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder={t("Regester.password")} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={t("Regester.confirmPassword")}
                                        name="confirmPassword"
                                        dependencies={["Book_Pass"]}
                                        rules={[
                                            { required: true, message: t("Regester.confirmPassword") + t("Regester.is required") },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue("Book_Pass") === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error(t("Regester.Passwords do not match!")));
                                                },
                                            })
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} placeholder={t("Regester.confirmPassword")} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label={
                                            <>
                                                {t("Regester.otp") + " "}
                                                {timer > 0 && (
                                                    <span style={{ color: "green", fontSize: 20, marginLeft: 12 }}>
                                                        ({Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")})
                                                    </span>
                                                )}
                                            </>
                                        }
                                        name="otp"
                                        rules={[
                                            { required: true, message: t("Regester.otpRequired") },
                                            { pattern: /^\d{6}$/, message: t("Regester.otpPattern") }
                                        ]}
                                    >
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <Input
                                                prefix={<SafetyOutlined />}
                                                placeholder={t("Regester.otp")}
                                                size="large"
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="primary"
                                                loading={otpLoading}
                                                onClick={handleOTPSubmit}
                                            >
                                                {t("Regester.sendOTP")}
                                            </Button>
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{ width: '100%' }}
                                    size="large"
                                    loading={loading}
                                >
                                    {t("Regester.register")}
                                </Button>
                            </Form.Item>
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                            <span>{t("Regester.alreadyAccount")} </span>
                            <span
                                style={{
                                    color: '#1890ff',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline',
                                }}
                                onClick={() => navigate('/login')}
                            >
                                {t("Regester.loginNow")}
                            </span>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Register;
