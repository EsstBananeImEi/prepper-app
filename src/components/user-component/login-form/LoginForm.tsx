import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { Button, Card, Form, Input, Typography, Alert, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserModel } from "../../../shared/Models";
import { itemsRoute, loginRoute, registerRoute } from "../../../shared/Constants";
import axios from "axios";
import styles from "./LoginForm.module.css";
import { useInviteRedirect } from "../../../hooks/useInviteProcessor";
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface AuthFormValues {
    email: string;
    password?: string;
    username?: string;
}

type FormMode = 'login' | 'register' | 'forgotPassword' | 'resetSuccess';

export default function AuthForm() {
    const { t } = useTranslation();
    const [formMode, setFormMode] = useState<FormMode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { dispatch } = useStore();
    const { handleLoginSuccess, isFromInvite } = useInviteRedirect();

    // Beim Laden der Komponente prüfen wir, ob ein Query-Parameter für resetSuccess vorliegt
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        // Prüfe ob wir auf der /register Route sind
        if (location.pathname === registerRoute) {
            setFormMode('register');
        } else if (searchParams.get('resetSuccess')) {
            setFormMode('resetSuccess');
            setInfo(searchParams.get('message') || t('auth.resetSuccess.defaultMessage'));
        }
    }, [location.pathname, t]);

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
            setError(t('user.form.validation.passwordMin'));
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

                // Flag löschen bei erfolgreichem Login, damit Invite-Verarbeitung funktioniert
                sessionStorage.removeItem('just_registered');
                sessionStorage.removeItem('prevent_auto_calls');

                // Verwende Invite-Redirect falls vorhanden, sonst Standard-Navigation
                if (isFromInvite()) {
                    handleLoginSuccess();
                } else {
                    navigate(itemsRoute);
                }
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

                // Wichtig: Flag setzen um automatische Invite-Verarbeitung zu verhindern
                sessionStorage.setItem('just_registered', 'true');

                // WICHTIG: Verhindere automatische API-Calls nach Registrierung
                // Setze Flag um Store-Updates und API-Calls zu verhindern
                sessionStorage.setItem('prevent_auto_calls', 'true');

                if (isFromInvite()) {
                    setInfo(t('auth.messages.registerInvite'));
                } else {
                    setInfo(t('auth.messages.registerDefault'));
                }
            } else if (formMode === 'forgotPassword') {
                // Bei 'forgotPassword' senden wir lediglich die E-Mail-Adresse
                await actionHandler({ type: "FORGOT_PASSWORD", email: values.email }, dispatch);
                setInfo(t('auth.messages.forgotSent'));
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response && err.response.data) {
                const backendError = err.response.data as { error: string };
                setError(backendError.error || t('auth.messages.unexpected'));
            } else {
                setError(t('auth.messages.unexpected'));
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
                        <Title level={2} className="text-center">{t('auth.resetSuccess.title')}</Title>
                        {info && <Alert message={info} type="success" showIcon className="mb-4" />}
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                setFormMode('login');
                                navigate(loginRoute);
                            }}
                        >
                            {t('auth.resetSuccess.toLogin')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Title level={2} className="text-center">
                            {formMode === 'login' && t('auth.titles.login')}
                            {formMode === 'register' && t('auth.titles.register')}
                            {formMode === 'forgotPassword' && t('auth.titles.forgotPassword')}
                        </Title>
                        {error && <Alert message={error} type="error" showIcon className="mb-4" />}
                        {info && <Alert message={info} type="info" showIcon className="mb-4" />}
                        <Form onFinish={handleSubmit} layout="vertical">
                            {formMode === 'register' && (
                                <Form.Item
                                    label={t('user.form.labels.username')}
                                    name="username"
                                    rules={[
                                        { required: true, message: t('user.form.validation.usernameRequired') },
                                        { min: 3, message: t('user.form.validation.usernameMin') },
                                    ]}
                                >
                                    <Input placeholder={t('user.form.labels.username')} />
                                </Form.Item>
                            )}
                            <Form.Item
                                label={t('user.form.labels.email')}
                                name="email"
                                rules={[
                                    { required: true, message: t('user.form.validation.emailRequired') },
                                    { type: "email", message: t('user.form.validation.emailInvalid') },
                                ]}
                            >
                                <Input placeholder={t('user.form.labels.email')} />
                            </Form.Item>
                            {formMode !== 'forgotPassword' && (
                                <Form.Item
                                    label={t('common.password') || 'Passwort'}
                                    name="password"
                                    rules={[
                                        { required: true, message: t('auth.validation.passwordRequired') },
                                        { min: 6, message: t('user.form.validation.passwordMin') },
                                    ]}
                                >
                                    <Input.Password placeholder={t('common.password') || 'Passwort'} />
                                </Form.Item>
                            )}
                            <Button type="primary" htmlType="submit" block disabled={loading}>
                                {loading ? <LoadingOutlined /> : formMode === 'login' ? t('auth.buttons.login') : formMode === 'register' ? t('auth.buttons.register') : t('auth.buttons.requestNewPassword')}
                            </Button>
                        </Form>
                        <div className="text-center mt-4">
                            {formMode === 'login' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>{t('auth.cta.noAccount')}</Text>
                                        <Button type="link" onClick={() => setFormMode('register')}>
                                            {t('auth.buttons.registerNow')}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button type="link" onClick={() => setFormMode('forgotPassword')}>
                                            {t('auth.buttons.forgotPassword')}
                                        </Button>
                                    </div>
                                </Space>
                            )}
                            {formMode === 'register' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>{t('auth.cta.haveAccount')}</Text>
                                        <Button type="link" onClick={() => setFormMode('login')}>
                                            {t('auth.buttons.loginHere')}
                                        </Button>
                                    </div>
                                </Space>
                            )}
                            {formMode === 'forgotPassword' && (
                                <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <Text>{t('auth.cta.backTo')}</Text>
                                        <Button type="link" onClick={() => setFormMode('login')}>
                                            {t('auth.titles.login')}
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
