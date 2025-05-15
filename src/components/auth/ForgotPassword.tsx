import { Button, Card, Form, Input, message } from "antd";
import { LockOutlined, NumberOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgetPassword, ResetPassword } from "../../services/authAPI";

const ForgotPassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [step, setStep] = useState<"mobile" | "otp">("mobile");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        try {
            const { Mobile_No } = await form.validateFields(["Mobile_No"]);
            setLoading(true);
            await ForgetPassword({ Mobile_No });
            message.success("OTP sent successfully!");
            setStep("otp");
        } catch {
            message.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            const { Mobile_No, otp, newPassword } = await form.validateFields();
            setLoading(true);
            await ResetPassword({ Mobile_No, otp, newPassword });
            message.success("Password updated successfully!");
            navigate("/login");
        } catch {
            message.error("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f0f2f5" }}>
            <Card title="Forgot Password" style={{ width: 400 }}>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Mobile Number"
                        name="Mobile_No"
                        rules={[
                            { required: true, message: "Please enter your mobile number" },
                            {
                                pattern: /^[6-9]\d{9}$/,
                                message: "Please enter a valid 10-digit mobile number",
                            },
                        ]}
                    >
                        <Input
                            addonBefore="+91"
                            maxLength={10}
                            placeholder="Enter mobile number"
                            onKeyPress={(e) => {
                                if (!/^\d$/.test(e.key)) e.preventDefault(); // block non-numeric input
                            }}
                        />
                    </Form.Item>


                    {step === "otp" && (
                        <>
                            <Form.Item
                                label="OTP"
                                name="otp"
                                rules={[
                                    { required: true, message: "Please enter the OTP" },
                                    {
                                        pattern: /^\d{6}$/,
                                        message: "OTP must be exactly 6 digits",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<NumberOutlined />}
                                    placeholder="Enter OTP"
                                    maxLength={6}
                                    onKeyPress={(e) => {
                                        if (!/^\d$/.test(e.key)) e.preventDefault(); // allow digits only
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                rules={[
                                    { required: true, message: "Please enter new password" },
                                    {
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{5,20}$/,
                                        message: "Password: 5-20 chars, 1 upper, 1 lower & 1 special!"
                                    }
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="New password" />
                            </Form.Item>

                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: "Please confirm your password" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Passwords do not match"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item>
                        {step === "mobile" ? (
                            <Button type="primary" block loading={loading} onClick={handleSendOtp}>
                                Send OTP
                            </Button>
                        ) : (
                            <Button type="primary" block loading={loading} onClick={handleResetPassword}>
                                Reset Password
                            </Button>
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Button type="link" block onClick={() => navigate("/login")}>
                            Back to Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
