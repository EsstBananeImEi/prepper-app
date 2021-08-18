import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import React, { ReactElement } from 'react';
import { useHistory, useParams } from 'react-router-dom';

export default function MyErrorMessage(): ReactElement {
    const { Paragraph, Text } = Typography;
    const { message } = useParams<{ message: string }>()
    const history = useHistory();

    const onGoToHome = () => {
        history.push('/home');
    }

    return (
        <Result
            status="error"
            title='An error occurred, please try again later'
            subTitle="if the problem persists, please contact your administrator!"
            extra={[
                <Button onClick={onGoToHome} type="ghost" key="home">
                    Home
                </Button>,

            ]}
        >

        </Result>
    )
}

