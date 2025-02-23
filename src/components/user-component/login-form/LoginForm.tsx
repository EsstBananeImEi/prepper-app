import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { Button, Card, Form, Input, Typography, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserModel } from "../../../shared/Models"; // ✅ Importiere das UserModel aus der richtigen Datei
import { homeRoute } from "../../../shared/Constants";

const { Title, Text } = Typography;

export default function AuthForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { dispatch } = useStore();

    // ✅ Login oder Registrierung durchführen
    const handleAuth = async (values: { email: string; password: string; username?: string }) => {
        setLoading(true);
        setError("");

        // Simulierte API-Validierung (Backend-Anbindung hier ergänzen)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (values.password.length < 6) {
            setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
            setLoading(false);
            return;
        }

        // ✅ User-Objekt mit passendem Typ
        const user: UserModel = {
            email: values.email,
            password: values.password,
            username: values.username || "",
            id: null,               // Jetzt `number | null` statt `string | null`
            access_token: null,
            refresh_token: null,    // Wird nach erfolgreichem Login gesetzt
            image: null             // Optionales Profilbild
        };

        const actionType = isRegister ? "REGISTER_USER" : "LOGIN_USER";
        actionHandler({ type: actionType, user }, dispatch);
        navigate(homeRoute);
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
                <Title level={2} className="text-center">
                    {isRegister ? "Registrieren" : "Login"}
                </Title>
                {error && <Alert message={error} type="error" showIcon className="mb-4" />}

                <Form onFinish={handleAuth} layout="vertical">

                    {/* Username-Feld wird nur bei Registrierung angezeigt */}
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
