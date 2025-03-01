import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { Button, Card, Form, Input, Typography, Alert, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserModel } from "../../../shared/Models";
import { itemsRoute } from "../../../shared/Constants";
import axios from "axios";
import styles from "./LoginForm.module.css";

const { Title, Text } = Typography;

interface AuthFormValues {
    email: string;
    password?: string;
    username?: string;
}

type FormMode = 'login' | 'register' | 'forgotPassword' | 'resetSuccess';

export default function AuthForm() {
    const [formMode, setFormMode] = useState<FormMode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { dispatch } = useStore();

    // Beim Laden der Komponente prüfen wir, ob ein Query-Parameter für resetSuccess vorliegt
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('resetSuccess')) {
            setFormMode('resetSuccess');
            setInfo(searchParams.get('message') || 'Passwort erfolgreich zurückgesetzt.');
        }
    }, []);

    // Löscht error und info, wenn sich entweder die Route oder der Formularmodus ändert
    useEffect(() => {
        setError("");
        if (formMode !== 'resetSuccess') {
            setInfo("");
        }
    }, [formMode]);

    const handleSubmit = async (values: AuthFormValues): Promise<void> => {
        setLoading(true);
        setError("");
        setInfo("");

        // Bei Login und Registrierung prüfen wir das Passwort
        if (formMode !== 'forgotPassword' && values.password && values.password.length < 6) {
            setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            setLoading(false);
            return;
        }

        try {
            if (formMode === 'login') {
                const user: UserModel = {
                    email: values.email,
                    password: values.password ?? null,
                    username: values.username ?? null,
                    persons: null,
                    id: null,
                    access_token: null,
                    refresh_token: null,
                    image: null,
                };
                await actionHandler({ type: "LOGIN_USER", user }, dispatch);
                navigate(itemsRoute);
            } else if (formMode === 'register') {
                const user: UserModel = {
                    email: values.email,
                    password: values.password ?? null,
                    username: values.username ?? null,
                    persons: null,
                    id: null,
                    access_token: null,
                    refresh_token: null,
                    image: null,
                };
                await actionHandler({ type: "REGISTER_USER", user }, dispatch);
                setInfo("Registrierung erfolgreich. Bitte aktivieren Sie Ihren Account über den in der E-Mail enthaltenen Link, bevor Sie sich einloggen.");
            } else if (formMode === 'forgotPassword') {
                // Bei 'forgotPassword' senden wir lediglich die E-Mail-Adresse
                await actionHandler({ type: "FORGOT_PASSWORD", email: values.email }, dispatch);
                setInfo("Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                const backendError = err.response.data as { error: string };
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
                {formMode === 'resetSuccess' ? (
                    <>
                        <Title level={2} className="text-center">Passwort zurückgesetzt</Title>
                        {info && <Alert message={info} type="success" showIcon className="mb-4" />}
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                setFormMode('login');
                                navigate('/login');
                            }}
                        >
                            Zum Login
                        </Button>
                    </>
                ) : (
                    <>
                        <Title level={2} className="text-center">
                            {formMode === 'login' && "Login"}
                            {formMode === 'register' && "Registrieren"}
                            {formMode === 'forgotPassword' && "Passwort zurücksetzen"}
                        </Title>
                        {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                        {info && <Alert message={info} type="info" showIcon className="mb-4" />}
                        <Form onFinish={handleSubmit} layout="vertical">
                            {formMode === 'register' && (
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
                            {formMode !== 'forgotPassword' && (
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
                            )}
                            <Button type="primary" htmlType="submit" block disabled={loading}>
                                {loading ? <LoadingOutlined /> : formMode === 'login' ? "Login" : formMode === 'register' ? "Registrieren" : "Neues Passwort anfordern"}
                            </Button>
                        </Form>
                        <div className="text-center mt-4">
                            {formMode === 'login' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>Noch kein Konto? </Text>
                                        <Button type="link" onClick={() => setFormMode('register')}>
                                            Jetzt registrieren
                                        </Button>
                                    </div>
                                    <div>
                                        <Button type="link" onClick={() => setFormMode('forgotPassword')}>
                                            Passwort vergessen?
                                        </Button>
                                    </div>
                                </Space>
                            )}
                            {formMode === 'register' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>Schon ein Konto?</Text>
                                        <Button type="link" onClick={() => setFormMode('login')}>
                                            Hier einloggen
                                        </Button>
                                    </div>
                                </Space>
                            )}
                            {formMode === 'forgotPassword' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>Zurück zum</Text>
                                        <Button type="link" onClick={() => setFormMode('login')}>
                                            Login
                                        </Button>
                                    </div>
                                </Space>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
