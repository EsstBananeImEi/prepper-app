import { Button, Result } from 'antd';
import React, { ReactElement, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { homeRoute } from '../../shared/Constants';

export default function MyErrorMessage(): ReactElement {
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
        title='Es ist ein Fehler aufgetreten. Bitte später erneut versuchen.'
            subTitle={`${message}`}
            extra={[
                <Button onClick={onGoToHome} ghost key="home">
            Zur Startseite
                </Button>,

            ]}
        >

        </Result>
    )
}

