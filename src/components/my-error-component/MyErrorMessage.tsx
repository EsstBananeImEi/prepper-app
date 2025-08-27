import { Button, Result } from 'antd';
import React, { ReactElement, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { homeRoute } from '../../shared/Constants';

export default function MyErrorMessage(): ReactElement {
    const { t } = useTranslation();
    const { message } = useParams<{ message: string }>();
    const history = useNavigate();

    useEffect(() => {
        // Protokolliere die Fehlermeldung in der Konsole
        console.error("Error message:", message);
    }, [message]);


    const onGoToHome = () => {
        history(homeRoute);
    }

    return (
        <Result
            status="error"
            title={t('errorPage.title')}
            subTitle={`${message}`}
            extra={[
                <Button onClick={onGoToHome} ghost key="home">
                    {t('errorPage.toHome')}
                </Button>,

            ]}
        >

        </Result>
    )
}

