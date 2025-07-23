import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import React, { ReactElement } from 'react';
import { useDemensions } from '../../hooks/StorageApi';

const { Text } = Typography;

interface Props {
    message?: string;
    size?: 'small' | 'default' | 'large';
    spinning?: boolean;
    children?: React.ReactNode;
    delay?: number;
}

export default function LoadingSpinner(props: Props): ReactElement {
    const [dimensions] = useDemensions(() => 1, 0);
    const {
        message = 'Laden...',
        size = 'large',
        spinning = true,
        children,
        delay = 200
    } = props;

    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} spin />;

    if (children) {
        return (
            <Spin
                indicator={antIcon}
                spinning={spinning}
                tip={message}
                delay={delay}
                style={{ width: '100%' }}
            >
                {children}
            </Spin>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: `${dimensions.height - 64}px`,
            minHeight: '200px',
            padding: 'var(--spacing-xl)'
        }}>
            <Spin
                indicator={antIcon}
                size={size}
                spinning={spinning}
                delay={delay}
                tip={message}
            />
        </div>
    );
}
