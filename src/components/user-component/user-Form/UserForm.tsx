import React, { useState, useEffect, JSX } from "react";
import { Form, Input, Button, Avatar, Card, Alert, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { UserModel } from "../../../shared/Models";

interface FormValues {
    username: string;
    email: string;
    password?: string;
}

export default function UserProfileForm(): JSX.Element {
    const { store, dispatch } = useStore();
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [image, setImage] = useState<string | null>(store.user?.image || null);

    /**
     * Custom Upload-Handler: Konvertiert die Datei in einen Base64‑String.
     */
    const customUpload = async ({ file, onSuccess, onError }: UploadRequestOption): Promise<void> => {
        if (!(file as File).type.startsWith("image/")) {
            message.error("Nur Bilddateien erlaubt.");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file as File);
        reader.onload = () => {
            const base64String = reader.result as string;
            setImage(base64String);
            onSuccess && onSuccess("ok");
            message.success("Bild erfolgreich hochgeladen");
        };
        reader.onerror = () => {
            message.error("Fehler beim Laden des Bildes.");
            onError && onError(new Error("Fehler beim Lesen der Datei."));
        };
    };

    /**
     * Formulardaten ans Backend senden.
     */
    const handleSubmit = async (values: FormValues): Promise<void> => {
        setLoading(true);
        setError("");
        try {
            if (!store.user) {
                throw new Error("User not found in store");
            }

            const payload: UserModel = {
                ...store.user,
                username: values.username.trim(),
                email: values.email.trim(),
                ...(values.password ? { password: values.password } : {}),
                ...(image ? { image } : {}),
            };

            await actionHandler({ type: "EDIT_USER", user: payload }, dispatch);
            message.success("Profil aktualisiert");
        } catch (err: unknown) {
            console.error("Fehler beim Aktualisieren des Profils:", err);
            setError("Fehler beim Aktualisieren des Profils");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            username: store.user?.username || "",
            email: store.user?.email || "",
            password: "",
        });
        setImage(store.user?.image || null);
    }, [store.user, form]);

    return (
        <Card title="Benutzerprofil" style={{ maxWidth: 600, margin: "auto" }}>
            {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
            <Form<FormValues> form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Benutzername"
                    name="username"
                    rules={[
                        { required: true, message: "Bitte Benutzername eingeben" },
                        { min: 3, message: "Der Benutzername muss mindestens 3 Zeichen lang sein." },
                        { pattern: /^\S.*\S$/, message: "Benutzername darf keine Leerzeichen am Anfang/Ende haben." }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="E-Mail-Adresse"
                    name="email"
                    rules={[
                        { required: true, message: "Bitte E-Mail eingeben" },
                        { type: "email", message: "Ungültige E-Mail" },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Neues Passwort (optional)"
                    name="password"
                    rules={[{ min: 6, message: "Das Passwort muss mindestens 6 Zeichen lang sein." }]}
                >
                    <Input.Password placeholder="Neues Passwort (falls ändern)" />
                </Form.Item>
                <Form.Item label="Profilbild">
                    <Upload customRequest={customUpload} showUploadList={false} accept="image/*">
                        <Button icon={<UploadOutlined />}>Bild hochladen</Button>
                    </Upload>
                    {image && <Avatar src={image} size={80} style={{ marginTop: 16, display: "block" }} />}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Profil aktualisieren
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
