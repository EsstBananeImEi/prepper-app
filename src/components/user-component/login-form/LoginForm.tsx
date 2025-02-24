import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { Button, Card, Form, Input, Typography, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserModel } from "../../../shared/Models";
import { homeRoute, itemsRoute } from "../../../shared/Constants";
import axios, { AxiosError } from "axios";
import styles from "./LoginForm.module.css";

const { Title, Text } = Typography;

// Interface für Backend-Fehlerantworten
interface BackendError {
    error: string;
}

export default function AuthForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { dispatch } = useStore();

    const handleAuth = async (values: { email: string; password: string; username?: string }): Promise<void> => {
        setLoading(true);
        setError("");

        if (values.password.length < 6) {
            setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            setLoading(false);
            return;
        }

        const user: UserModel = {
            email: values.email,
            password: values.password,
            username: values.username || "",
            id: null,
            access_token: null,
            refresh_token: null,
            image: null,
        };

        const actionType = isRegister ? "REGISTER_USER" : "LOGIN_USER";

        try {
            await actionHandler({ type: actionType, user }, dispatch);
            navigate(itemsRoute);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                const backendError = err.response.data as BackendError;
                setError(backendError.error || "Ein unerwarteter Fehler ist aufgetreten.");
            } else {
                setError("Ein unerwarteter Fehler ist aufgetreten.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-screen bg-gray-10 ${styles.container}`}>
            <Card className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
                <Title level={2} className="text-center">
                    {isRegister ? "Registrieren" : "Login"}
                </Title>
                {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                <Form onFinish={handleAuth} layout="vertical">
                    {isRegister && (
                        <Form.Item
                            label="Benutzername"
                            name="username"
                            rules={[
                                { required: true, message: "Bitte einen Benutzernamen eingeben!" },
                                { min: 3, message: "Der Benutzername muss mindestens 3 Zeichen lang sein." },
                            ]}
                        >
                            <Input placeholder="Benutzername" />
                        </Form.Item>
                    )}
                    <Form.Item
                        label="E-Mail-Adresse"
                        name="email"
                        rules={[
                            { required: true, message: "Bitte E-Mail eingeben!" },
                            { type: "email", message: "Ungültige E-Mail-Adresse!" },
                        ]}
                    >
                        <Input placeholder="E-Mail" />
                    </Form.Item>
                    <Form.Item
                        label="Passwort"
                        name="password"
                        rules={[
                            { required: true, message: "Bitte Passwort eingeben!" },
                            { min: 6, message: "Das Passwort muss mindestens 6 Zeichen lang sein." },
                        ]}
                    >
                        <Input.Password placeholder="Passwort" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block disabled={loading}>
                        {loading ? <LoadingOutlined /> : isRegister ? "Registrieren" : "Login"}
                    </Button>
                </Form>
                <div className="text-center mt-4">
                    <Text>
                        {isRegister ? "Schon ein Konto?" : "Noch kein Konto?"}{" "}
                        <Button type="link" onClick={() => setIsRegister(!isRegister)}>
                            {isRegister ? "Hier einloggen" : "Jetzt registrieren"}
                        </Button>
                    </Text>
                </div>
            </Card>
        </div>
    );
}
