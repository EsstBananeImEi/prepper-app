import { Button, Result } from 'antd';
import React, { ReactElement, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { homeRoute } from '../../shared/Constants';

export default function MyErrorMessage(): ReactElement {
    const { message } = useParams<{ message: string }>();
    const history = useHistory();

    useEffect(() => {
        // Protokolliere die Fehlermeldung in der Konsole
        console.error("Error message:", message);
    }, [message]);


    const onGoToHome = () => {
        history.push(homeRoute);
    }

    return (
        <Result
            status="error"
            title='An error occurred, please try again later'
            subTitle={`${message}`}
            extra={[
                <Button onClick={onGoToHome} type="ghost" key="home">
                    Home
                </Button>,

            ]}
        >

        </Result>
    )
}

