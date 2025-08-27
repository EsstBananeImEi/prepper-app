import React, { useState, useEffect, JSX } from "react";
import { Form, Input, Button, Avatar, Card, Alert, message, Upload, InputNumber, Tabs } from "antd";
import { UploadOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { useStore } from "../../../store/Store";
import { actionHandler } from "../../../store/Actions";
import { UserModel } from "../../../shared/Models";
import GroupManagement from "../group-management/GroupManagement";
import styles from "./UserForm.module.css";
import { useTranslation } from 'react-i18next';

interface FormValues {
    username: string;
    email: string;
    password?: string;
    persons: number;
}

export default function UserProfileForm(): JSX.Element {
    const { store, dispatch } = useStore();
    const { t } = useTranslation();
    const [form] = Form.useForm<FormValues>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [image, setImage] = useState<string | null>(store.user?.image || null);

    const customUpload = async ({ file, onSuccess, onError }: UploadRequestOption): Promise<void> => {
        if (!(file as File).type.startsWith("image/")) {
            message.error(t('user.form.upload.onlyImages'));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file as File);
        reader.onload = () => {
            const base64String = reader.result as string;
            setImage(base64String);
            onSuccess && onSuccess("ok");
            message.success(t('user.form.upload.uploadSuccess'));
        };
        reader.onerror = () => {
            message.error(t('user.form.upload.uploadError'));
            onError && onError(new Error(t('user.form.upload.uploadError')));
        };
    };

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
                persons: values.persons,
                ...(values.password ? { password: values.password } : {}),
                ...(image ? { image } : {}),
            };

            await actionHandler({ type: "EDIT_USER", user: payload }, dispatch);
            message.success(t('user.form.buttons.updateProfile'));
        } catch (err: unknown) {
            console.error("Fehler beim Aktualisieren des Profils:", err);
            setError(t('notifications.apiErrorTitle'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            username: store.user?.username || "",
            email: store.user?.email || "",
            password: "",
            persons: store.user?.persons || 1,
        });
        setImage(store.user?.image || null);
    }, [store.user, form]);

    const profileTab = (
        <>
            {error && <Alert message={error} type="error" className={styles.alert} />}
            <Form<FormValues> form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label={t('user.form.labels.username')}
                    name="username"
                    rules={[
                        { required: true, message: t('user.form.validation.usernameRequired') },
                        { min: 3, message: t('user.form.validation.usernameMin') },
                        { pattern: /^\S.*\S$/, message: t('user.form.validation.usernameTrim') }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('user.form.labels.email')}
                    name="email"
                    rules={[
                        { required: true, message: t('user.form.validation.emailRequired') },
                        { type: "email", message: t('user.form.validation.emailInvalid') },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('user.form.labels.passwordNew')}
                    name="password"
                    rules={[{ min: 6, message: t('user.form.validation.passwordMin') }]}
                >
                    <Input.Password placeholder={t('user.form.placeholders.passwordOptional')} />
                </Form.Item>
                <Form.Item
                    label={t('user.form.labels.persons')}
                    name="persons"
                    rules={[
                        { required: false, message: t('user.form.validation.personsNumber') },
                        { type: "number", message: t('user.form.validation.personsNumber') },
                    ]}
                >
                    <InputNumber min={1} />
                </Form.Item>
                <Form.Item label={t('user.form.labels.profileImage')}>
                    <Upload customRequest={customUpload} showUploadList={false} accept="image/*">
                        <Button icon={<UploadOutlined />}>{t('user.form.upload.selectImage')}</Button>
                    </Upload>
                    {image && <Avatar src={image} size={80} className={styles.avatar} />}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        {t('user.form.buttons.updateProfile')}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );

    return (
        <div className={styles.container}>
            <Card title={t('user.title')} className={styles.card}>
                <Tabs
                    defaultActiveKey="profile"
                    items={[
                        {
                            key: 'profile',
                            label: (
                                <span>
                                    <UserOutlined />
                                    {t('user.tabs.profile')}
                                </span>
                            ),
                            children: profileTab
                        },
                        {
                            key: 'groups',
                            label: (
                                <span>
                                    <TeamOutlined />
                                    {t('user.tabs.groups')}
                                </span>
                            ),
                            children: <GroupManagement />
                        }
                    ]}
                />
            </Card>
        </div>
    );
}

